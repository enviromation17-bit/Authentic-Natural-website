import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Authentic Naturals | Hair Repair & Revive Growth Oil',
  description: 'Discover Authentic Naturals Hair Repair & Revive Growth Oil — a pure botanical blend for stronger, healthier hair.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
