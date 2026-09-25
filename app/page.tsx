'use client';

import React, { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import { Flame, Download, RefreshCw, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';

interface RoastResult {
  punchline: string;
  corporateSpeakRating: number;
  ghostingRisk: number;
  cringeFactor: string;
  bulletRoasts: string[];
  actualAdvice: string;
}

export default function Home() {
  const [profileType, setProfileType] = useState<'Resume' | 'LinkedIn' | 'GitHub README'>('Resume');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoastResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  const handleRoast = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, type: profileType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to roast');

      setResult(data);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `roasted-${profileType.toLowerCase().replace(' ', '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error downloading card image:', err);
    }
  };

  const loadSample = () => {
    if (profileType === 'Resume') {
      setInputText(
        `Dynamic self-starter and thought leader with 2+ years of experience leveraging synergy in high-velocity agile environments. Built an end-to-end full-stack Todo App using React and Tailwind. Spearheaded cross-functional communication by attending standup meetings daily.`
      );
    } else if (profileType === 'LinkedIn') {
      setInputText(
        `Ex-FAANG aspirant | Top 1% LeetCode enthusiast | Generative AI Evangelist | Helping founders scale from 0 to 1 | Keynote Attendee | Let's connect and synergize 🚀`
      );
    } else {
      setInputText(
        `# My Ultimate Boilerplate 🚀\nWelcome to my repository. It has no documentation yet, but please star this repo if you find it helpful! PRs welcome. Built with ❤️ and lots of coffee.`
      );
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center p-6 md:p-12">
      {/* Header */}
      <div className="max-w-2xl text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/70 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider">
          <Flame className="w-4 h-4 text-red-500 animate-pulse" /> Savage AI Career Critic
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-red-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
          Roast My Profile
        </h1>
        <p className="text-neutral-400 text-sm md:text-base">
          Get a sharp, internet-fluent critique of your Resume, LinkedIn headline, or GitHub README.
        </p>
      </div>

      <div className="w-full max-w-2xl space-y-6">
        {/* Profile Selector */}
        <div className="flex bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
          {(['Resume', 'LinkedIn', 'GitHub README'] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                setProfileType(type);
                setResult(null);
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                profileType === type
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Text Input Box */}
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Paste your ${profileType} text here...`}
            rows={6}
            className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 text-sm font-mono text-neutral-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none transition-all placeholder:text-neutral-600"
          />
          <button
            onClick={loadSample}
            className="absolute bottom-3 right-3 text-xs text-neutral-500 hover:text-neutral-300 underline underline-offset-4"
          >
            Insert cringe sample
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRoast}
          disabled={loading || !inputText.trim()}
          className="w-full py-3.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-950/40 cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" /> Roasting your ego...
            </>
          ) : (
            <>
              <Flame className="w-5 h-5" /> Roast This {profileType}
            </>
          )}
        </button>

        {error && (
          <div className="p-4 bg-red-950/40 border border-red-900 rounded-xl text-red-300 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Result & Screenshot Card */}
        {result && (
          <div className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-wider text-neutral-500 font-bold">
                Your Shareable Roast Card
              </span>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold rounded-lg text-neutral-200 transition"
              >
                <Download className="w-3.5 h-3.5" /> Download as Image
              </button>
            </div>

            {/* The Visual Card capture target */}
            <div
              ref={cardRef}
              className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl space-y-6 relative overflow-hidden"
            >
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-500" />
                  <span className="font-mono text-sm tracking-tight text-neutral-300 font-bold uppercase">
                    AI CRITIC // {profileType}
                  </span>
                </div>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-neutral-800 text-red-400 border border-neutral-700">
                  Cringe: {result.cringeFactor}
                </span>
              </div>

              {/* Punchline */}
              <div className="space-y-1">
                <div className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-bold">Verdict</div>
                <blockquote className="text-lg md:text-xl font-bold text-neutral-100 italic leading-snug">
                  &ldquo;{result.punchline}&rdquo;
                </blockquote>
              </div>

              {/* Metrics Meters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-950/60 p-3.5 rounded-xl border border-neutral-800/80">
                  <div className="text-xs text-neutral-400 mb-1 flex justify-between">
                    <span>Corporate Buzzwords</span>
                    <span className="font-mono text-red-400 font-bold">{result.corporateSpeakRating}%</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-red-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${result.corporateSpeakRating}%` }}
                    />
                  </div>
                </div>

                <div className="bg-neutral-950/60 p-3.5 rounded-xl border border-neutral-800/80">
                  <div className="text-xs text-neutral-400 mb-1 flex justify-between">
                    <span>Ghosting Likelihood</span>
                    <span className="font-mono text-orange-400 font-bold">{result.ghostingRisk}%</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-red-600 h-full rounded-full transition-all duration-700"
                      style={{ width: `${result.ghostingRisk}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bullet Roasts */}
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-bold">The Breakdown</div>
                <ul className="space-y-2">
                  {result.bulletRoasts.map((roast, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-neutral-300">
                      <span className="text-red-500 font-bold">✕</span>
                      <span>{roast}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Genuine Advice Section */}
              <div className="bg-emerald-950/20 border border-emerald-900/40 p-3.5 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-300 leading-relaxed">
                  <span className="font-semibold text-emerald-200">The Fix: </span>
                  {result.actualAdvice}
                </div>
              </div>

              {/* Branding Footer on screenshot */}
              <div className="pt-2 flex justify-between items-center text-[10px] font-mono text-neutral-500">
                <span>Roasted with AI Critic</span>
                <span>roast-my-profile.vercel.app</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}