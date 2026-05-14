import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VibeKit | Sequential requirements for vibe-coded apps',
  description: 'A guided workspace for turning app ideas into sequential AI-ready build prompts.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
