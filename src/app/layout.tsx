import type { Metadata } from 'next';
import { Fraunces, Work_Sans, Noto_Sans_Ethiopic } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
  style: ['normal', 'italic']
});
const workSans = Work_Sans({ subsets: ['latin'], variable: '--font-body', weight: ['400', '500', '600', '700'] });
const notoEthiopic = Noto_Sans_Ethiopic({ subsets: ['ethiopic'], variable: '--font-amharic', weight: ['400', '600'] });

export const metadata: Metadata = {
  title: 'HabeshaBistro — Ethiopian Kitchen',
  description: 'Authentic Ethiopian cuisine, gathered around one plate — order online or reserve a table.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${workSans.variable} ${notoEthiopic.variable}`}>
      <body className="min-h-screen bg-ink text-cream font-body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
