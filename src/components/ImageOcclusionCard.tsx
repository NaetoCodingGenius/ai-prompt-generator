'use client';

import { useEffect, useRef } from 'react';
import { Flashcard } from '@/types/studyset';
import { Card, CardContent } from '@/components/ui/card';

interface ImageOcclusionCardProps {
  flashcard: Flashcard;
  showAnswer: boolean;
}

export function ImageOcclusionCard({ flashcard, showAnswer }: ImageOcclusionCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const drawCard = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !flashcard.imageUrl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw occlusions
    if (flashcard.occlusions) {
      flashcard.occlusions.forEach((occ) => {
        const x = (occ.x / 100) * canvas.width;
        const y = (occ.y / 100) * canvas.height;
        const width = (occ.width / 100) * canvas.width;
        const height = (occ.height / 100) * canvas.height;

        if (!showAnswer) {
          // Hide the area with black rectangle
          ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
          ctx.fillRect(x, y, width, height);

          // Draw question mark
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('?', x + width / 2, y + height / 2);
        } else {
          // Reveal with green highlight
          ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
          ctx.fillRect(x, y, width, height);

          // Draw label
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(occ.label, x + width / 2, y + height / 2);

          // Draw border
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, width, height);
        }
      });
    }
  };

  useEffect(() => {
    drawCard();
  }, [flashcard, showAnswer]);

  if (flashcard.type !== 'image-occlusion' || !flashcard.imageUrl) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Question */}
          <div className="text-center">
            <p className="text-lg font-medium">{flashcard.front}</p>
          </div>

          {/* Image Canvas */}
          <div className="relative">
            <img
              ref={imageRef}
              src={flashcard.imageUrl}
              alt="Study image"
              className="hidden"
              onLoad={drawCard}
            />
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="w-full border rounded"
            />
          </div>

          {/* Answer (when revealed) */}
          {showAnswer && (
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Answer:</p>
              <p className="text-lg font-medium">{flashcard.back}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
