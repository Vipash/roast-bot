import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: "The AI critic was fired because someone forgot to set the API key in environment settings." },
        { status: 500 }
      );
    }

    const { text, type } = await req.json();

    // Edge case: Empty or too short
    if (!text || text.trim().length < 15) {
      return NextResponse.json(
        { error: "We can't critique a ghost profile. Give us at least a sentence with some substance to roast." },
        { status: 400 }
      );
    }

    // Edge case: Excessive payload (truncate to avoid model token overruns)
    const sanitizedText = text.trim().slice(0, 6000);

    // 1. Fetch available models from Groq
    const modelsRes = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    
    if (!modelsRes.ok) {
      return NextResponse.json(
        { error: "Groq is taking a breather from burning egos. Please retry in 10 seconds." },
        { status: 503 }
      );
    }

    const modelsData = await modelsRes.json();
    const availableModelIds: string[] = modelsData.data?.map((m: any) => m.id) || [];

    const preferredModels = [
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'qwen/qwen3.8-27b',
      'deepseek-r1-distill-llama-70b',
      'gemma2-9b-it',
    ];

    const selectedModel =
      preferredModels.find((m) => availableModelIds.includes(m)) ||
      availableModelIds.find((m) => !m.includes('whisper') && !m.includes('guard')) ||
      availableModelIds[0];

    const systemPrompt = `
You are a sharp, brutally honest, internet-culture-fluent tech critic and career realist.
You specialize in dissecting ${type}s (resumes, LinkedIn headlines/bios, or GitHub profiles).
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

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        temperature: 0.85,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze and roast this ${type}:\n\n${sanitizedText}` },
        ],
      }),
    });

    if (groqRes.status === 429) {
      return NextResponse.json(
        { error: "Too much cringe at once! The rate limiter tripped. Give it 15 seconds." },
        { status: 429 }
      );
    }

    const data = await groqRes.json();
    if (!groqRes.ok) {
      throw new Error(data.error?.message || 'Inference error');
    }

    let rawContent = data.choices[0]?.message?.content || '{}';
    rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const roastData = JSON.parse(rawContent);

    return NextResponse.json(roastData);
  } catch (error: any) {
    return NextResponse.json(
      { error: "The AI choked trying to parse this. Either your profile broke our model or the server timed out. Try again!" },
      { status: 500 }
    );
  }
}