import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Prompt Generator - Create Professional AI Prompts with Claude",
  description: "Free AI-powered prompt generator using Claude Opus 4. Create professional, tailored prompts for coding, writing, analysis, and more. Get better AI responses instantly.",
  keywords: ["AI prompt generator", "Claude AI", "prompt engineering", "AI prompts", "ChatGPT prompts", "prompt creator"],
  authors: [{ name: "AI Prompt Generator" }],
  openGraph: {
    title: "AI Prompt Generator - Create Professional AI Prompts",
    description: "Generate professional-level prompts for any AI system. Powered by Claude Opus 4.",
    type: "website",
    url: "https://ai-prompt-generator-beta.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Prompt Generator",
    description: "Create professional AI prompts powered by Claude",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
      <head>
        {/* Google AdSense */}
        {adsenseId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}

        {/* Google Analytics */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
