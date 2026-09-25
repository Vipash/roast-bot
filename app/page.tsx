'use client';

import React, { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import { Flame, Download, RefreshCw, AlertTriangle, CheckCircle2, Share2 } from 'lucide-react';

interface RoastResult {
  punchline: string;
  corporateSpeakRating: number;
  ghostingRisk: number;
  cringeFactor: string;
  bulletRoasts: string[];
  actualAdvice: string;
}

export default function Home() {
  const [profileType, setProfileType] = useState<'Resume' | 'LinkedIn' | 'GitHub'>('GitHub');
  const [inputText, setInputText] = useState('');
  const [githubUser, setGithubUser] = useState('');
  const [fetchingGithub, setFetchingGithub] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoastResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  // 1. Fetch public profile and top repos directly from GitHub API
  const handleFetchGithub = async () => {
    if (!githubUser.trim()) return;
    setFetchingGithub(true);
    setError(null);

    try {
      const userRes = await fetch(`https://api.github.com/users/${githubUser.trim()}`);
      if (!userRes.ok) {
        if (userRes.status === 404) throw new Error(`GitHub user "${githubUser}" not found.`);
        throw new Error('Failed to fetch from GitHub API.');
      }
      const userData = await userRes.json();

      // Fetch recent 5 repositories
      const reposRes = await fetch(
        `https://api.github.com/users/${githubUser.trim()}/repos?sort=pushed&per_page=5`
      );
      const reposData = await reposRes.json();

      const repoSummaries = Array.isArray(reposData)
        ? reposData
            .map(
              (r: any) =>
                `- ${r.name} (${r.language || 'No language'}): "${r.description || 'No description'}" [⭐ ${r.stargazers_count}]`
            )
            .join('\n')
        : 'No public repositories found.';

      const compiledProfile = `
GitHub Handle: @${userData.login}
Name: ${userData.name || 'Anonymous'}
Bio: ${userData.bio || 'No bio provided.'}
Company: ${userData.company || 'None'}
Location: ${userData.location || 'Unknown'}
Followers: ${userData.followers} | Following: ${userData.following} | Public Repos: ${userData.public_repos}

Recent Repositories:
${repoSummaries}
      `.trim();

      setInputText(compiledProfile);
    } catch (err: any) {
      setError(err.message || 'Error fetching GitHub profile.');
    } finally {
      setFetchingGithub(false);
    }
  };

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
      if (!res.ok) throw new Error(data.error || 'Failed to generate roast');

      setResult(data);
      confetti({ particleCount: 65, spread: 75, origin: { y: 0.6 } });
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
      link.download = `roasted-${profileType.toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download card error:', err);
    }
  };

  const handleTweet = () => {
    if (!result) return;
    const tweetText = `My ${profileType} just got roasted by AI:\n\n"${result.punchline}" 💀\n\nCheck yours here:`;
    const url = 'https://roast-bot-plum.vercel.app';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`, '_blank');
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
      setGithubUser('torvalds');
      setInputText(
        `GitHub Handle: @torvalds\nName: Linus Torvalds\nBio: Creator of Linux and Git\nPublic Repos: 6 | Followers: 200,000+\nRecent Repos:\n- linux (C): "Linux kernel source tree" [⭐ 180000]\n- subsurface-for-dir (C++): "Divelog program" [⭐ 400]`
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
          Get a sharp, internet-fluent critique of your GitHub, Resume, or LinkedIn headline.
        </p>
      </div>

      <div className="w-full max-w-2xl space-y-6">
        {/* Profile Selector */}
        <div className="flex bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
          {(['GitHub', 'Resume', 'LinkedIn'] as const).map((type) => (
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
              {type === 'GitHub' ? 'GitHub Ingestion' : type}
            </button>
          ))}
        </div>

        {/* GitHub Ingestion Input Bar (Visible only on GitHub tab) */}
        {profileType === 'GitHub' && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-3 flex items-center text-neutral-500 font-mono text-sm">@</span>
              <input
                type="text"
                value={githubUser}
                onChange={(e) => setGithubUser(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetchGithub()}
                placeholder="github_username (e.g. torvalds, gaearon)"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono text-neutral-200 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>
            <button
              onClick={handleFetchGithub}
              disabled={fetchingGithub || !githubUser.trim()}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              {fetchingGithub ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              )}
              Fetch Profile
            </button>
          </div>
        )}

        {/* Content Box */}
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
              <RefreshCw className="w-5 h-5 animate-spin" /> Cooking roast...
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
              <div className="flex gap-2">
                <button
                  onClick={handleTweet}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold rounded-lg text-neutral-200 transition"
                >
                  <Share2 className="w-3.5 h-3.5 text-blue-400" /> Post to X
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold rounded-lg text-neutral-200 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Download PNG
                </button>
              </div>
            </div>

            {/* Visual Card capture target */}
            <div
              ref={cardRef}
              className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl space-y-6 relative overflow-hidden"
            >
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

              {/* Advice */}
              <div className="bg-emerald-950/20 border border-emerald-900/40 p-3.5 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-300 leading-relaxed">
                  <span className="font-semibold text-emerald-200">The Fix: </span>
                  {result.actualAdvice}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-2 flex justify-between items-center text-[10px] font-mono text-neutral-500">
                <span>Roasted with AI Critic</span>
                <span>roast-bot-plum.vercel.app</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}