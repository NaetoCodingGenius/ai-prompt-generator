'use client';

import { Card } from '@/components/ui/card';

interface AdBannerProps {
  slot: string;
  format?: 'horizontal' | 'vertical' | 'rectangle';
}

export function AdBanner({ slot, format = 'horizontal' }: AdBannerProps) {
  // This is a placeholder for Google AdSense
  // You'll replace this with actual AdSense code after approval

  return (
    <Card className="p-4 bg-muted/50 border-dashed">
      <div className="text-center text-xs text-muted-foreground">
        <p className="font-medium mb-1">Advertisement Space</p>
        <p>
          {format === 'horizontal' && '728 x 90 - Leaderboard'}
          {format === 'vertical' && '160 x 600 - Wide Skyscraper'}
          {format === 'rectangle' && '336 x 280 - Large Rectangle'}
        </p>
        <p className="mt-2 text-[10px]">
          Replace this with Google AdSense code in production
        </p>
      </div>
      {/*
        TODO: After getting AdSense approval, replace with:
        <ins className="adsbygoogle"
             style={{display: 'block'}}
             data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
             data-ad-slot={slot}
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
      */}
    </Card>
  );
}
