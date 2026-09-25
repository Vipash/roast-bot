import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://roast-bot-plum.vercel.app'),
  title: 'Roast My Profile — Savage AI Career & GitHub Critic',
  description:
    'An internet-fluent AI critic that dissects resumes, LinkedIn headlines, and GitHub profiles with brutal honesty and shareable cards.',
  keywords: ['AI roast', 'resume roast', 'github roast', 'career critic', 'tech humor'],
  authors: [{ name: 'Your Name' }],
  openGraph: {
    title: 'Roast My Profile — Savage AI Career & GitHub Critic',
    description:
      'Paste your resume, LinkedIn bio, or GitHub handle to get a brutally honest, shareable critique.',
    url: 'https://roast-bot-plum.vercel.app',
    siteName: 'Roast My Profile',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roast My Profile — Savage AI Career & GitHub Critic',
    description:
      'Paste your resume, LinkedIn bio, or GitHub handle to get a brutally honest, shareable critique.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-neutral-950 text-neutral-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}