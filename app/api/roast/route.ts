import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // baseURL: process.env.OPENAI_BASE_URL || undefined, // uncomment if using Groq
});

export async function POST(req: Request) {
  try {
    const { text, type } = await req.json();

    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        { error: 'Please give us more content to work with (at least 20 chars).' },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are a sharp, brutally honest, internet-culture-fluent tech critic and career realist.
You specialize in dissecting ${type}s (resumes, LinkedIn headlines/bios, or GitHub READMEs).
Tone: Witty, savage, self-aware, and dead-accurate. Think tech Twitter / Blind / Reddit meets Gordon Ramsay.
Roast buzzwords like "passionate visionary", "synergized", "AI enthusiast", over-engineered hobby projects, and inflated metrics.

You MUST respond strictly in valid JSON with this exact schema:
{
  "punchline": "A single brutal, punchy one-sentence summary of their profile",
  "corporateSpeakRating": 85, // number from 0 to 100
  "ghostingRisk": 90, // number from 0 to 100
  "cringeFactor": "Terminal / High / Mild / Low",
  "bulletRoasts": [
    "Specific roast point 1 targeting their buzzwords or vague claims",
    "Specific roast point 2 targeting their formatting, title inflation, or generic tech stack",
    "Specific roast point 3 targeting the vibe they are giving off"
  ],
  "actualAdvice": "One single sentence of genuine, high-value tactical advice so this is actually useful."
}
Only return the raw JSON object, no markdown quotes (\`\`\`json).`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // or 'llama-3.3-70b-versatile' on Groq
      temperature: 0.9,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze and roast this ${type}:\n\n${text}` },
      ],
    });

    const roastData = JSON.parse(response.choices[0].message.content || '{}');
    return NextResponse.json(roastData);
  } catch (error: any) {
    console.error('Roast error:', error);
    return NextResponse.json(
      { error: error?.message || 'The AI choked on that cringe. Try again.' },
      { status: 500 }
    );
  }
}