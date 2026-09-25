import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is missing in your .env.local file.' },
        { status: 500 }
      );
    }

    const { text, type } = await req.json();

    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        { error: 'Please provide at least 20 characters to roast.' },
        { status: 400 }
      );
    }

    // 1. Ask Groq which models YOUR account is permitted to use
    const modelsRes = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const modelsData = await modelsRes.json();
    const availableModelIds: string[] = modelsData.data?.map((m: any) => m.id) || [];

    // Print to your terminal so you can see all models your key can use
    console.log('✅ Models available on your Groq key:', availableModelIds);

    // 2. Prioritize the best conversational models available on your account
    const preferredModels = [
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'qwen/qwen3.8-27b',
      'deepseek-r1-distill-llama-70b',
      'gemma2-9b-it',
    ];

    // Pick the highest priority model or fall back to any active text model
    const selectedModel =
      preferredModels.find((m) => availableModelIds.includes(m)) ||
      availableModelIds.find(
        (m) => !m.includes('whisper') && !m.includes('guard') && !m.includes('tts')
      ) ||
      availableModelIds[0];

    if (!selectedModel) {
      throw new Error('No active chat models found for your Groq API key.');
    }

    console.log(`🚀 Using model: ${selectedModel}`);

    const systemPrompt = `
You are a sharp, brutally honest, internet-culture-fluent tech critic and career realist.
You specialize in dissecting ${type}s (resumes, LinkedIn headlines/bios, or GitHub READMEs).
Tone: Witty, savage, self-aware, and dead-accurate. Think tech Twitter / Blind / Reddit meets Gordon Ramsay.
Roast buzzwords like "passionate visionary", "synergized", "AI enthusiast", over-engineered hobby projects, and inflated metrics.

You MUST respond strictly in valid JSON with this exact schema:
{
  "punchline": "A single brutal, punchy one-sentence summary of their profile",
  "corporateSpeakRating": 85,
  "ghostingRisk": 90,
  "cringeFactor": "Terminal",
  "bulletRoasts": [
    "Specific roast point 1 targeting their buzzwords or vague claims",
    "Specific roast point 2 targeting their formatting, title inflation, or generic tech stack",
    "Specific roast point 3 targeting the vibe they are giving off"
  ],
  "actualAdvice": "One single sentence of genuine, high-value tactical advice so this is actually useful."
}
Only return the raw JSON object, no markdown quotes.`;

    // 3. Request completion from Groq using the selected model
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        temperature: 0.8,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze and roast this ${type}:\n\n${text}` },
        ],
      }),
    });

    const data = await groqRes.json();

    if (!groqRes.ok) {
      console.error('Groq Error:', data);
      throw new Error(data.error?.message || `Groq failed with status ${groqRes.status}`);
    }

    let rawContent = data.choices[0]?.message?.content || '{}';
    // Clean any markdown formatting if present
    rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const roastData = JSON.parse(rawContent);

    return NextResponse.json(roastData);
  } catch (error: any) {
    console.error('Roast error:', error);
    return NextResponse.json(
      { error: error?.message || 'The AI choked on that. Please try again.' },
      { status: 500 }
    );
  }
}