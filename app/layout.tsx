import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Authentic Naturals | Hair Repair & Revive Growth Oil',
  description: 'Discover Authentic Naturals Hair Repair & Revive Growth Oil, 100 ml. PKR 1,499 with free delivery across Pakistan.',
  themeColor: '#1f3324',
  robots: 'noindex, nofollow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-PK">
      <body>{children}</body>
    </html>
  );
}
