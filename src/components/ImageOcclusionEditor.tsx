'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { X, Plus, Save, Trash2 } from 'lucide-react';
import { Occlusion, Flashcard } from '@/types/studyset';
import toast from 'react-hot-toast';

interface ImageOcclusionEditorProps {
  onSave: (flashcards: Flashcard[]) => void;
  onCancel: () => void;
}

interface DrawingRect {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export function ImageOcclusionEditor({ onSave, onCancel }: ImageOcclusionEditorProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [occlusions, setOcclusions] = useState<Occlusion[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingRect, setDrawingRect] = useState<DrawingRect | null>(null);
  const [selectedOcclusion, setSelectedOcclusion] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Max 5MB.');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target?.result as string);
      setOcclusions([]);
    };
    reader.readAsDataURL(file);
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !imageUrl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw existing occlusions
    occlusions.forEach((occ) => {
      const x = (occ.x / 100) * canvas.width;
      const y = (occ.y / 100) * canvas.height;
      const width = (occ.width / 100) * canvas.width;
      const height = (occ.height / 100) * canvas.height;

      // Draw filled rectangle
      ctx.fillStyle = selectedOcclusion === occ.id ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(x, y, width, height);

      // Draw border
      ctx.strokeStyle = selectedOcclusion === occ.id ? '#ff0000' : '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // Draw label
      if (occ.label) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.fillText(occ.label, x + 5, y + 20);
      }
    });

    // Draw current drawing rectangle
    if (isDrawing && drawingRect) {
      const x = Math.min(drawingRect.startX, drawingRect.currentX);
      const y = Math.min(drawingRect.startY, drawingRect.currentY);
      const width = Math.abs(drawingRect.currentX - drawingRect.startX);
      const height = Math.abs(drawingRect.currentY - drawingRect.startY);

      ctx.fillStyle = 'rgba(0, 100, 255, 0.3)';
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = '#0066ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
    }
  };

  useEffect(() => {
    drawCanvas();
  }, [imageUrl, occlusions, drawingRect, isDrawing, selectedOcclusion]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setDrawingRect({ startX: x, startY: y, currentX: x, currentY: y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawingRect) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDrawingRect({ ...drawingRect, currentX: x, currentY: y });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !drawingRect || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const x = Math.min(drawingRect.startX, drawingRect.currentX);
    const y = Math.min(drawingRect.startY, drawingRect.currentY);
    const width = Math.abs(drawingRect.currentX - drawingRect.startX);
    const height = Math.abs(drawingRect.currentY - drawingRect.startY);

    // Ignore tiny rectangles (accidental clicks)
    if (width < 10 || height < 10) {
      setIsDrawing(false);
      setDrawingRect(null);
      return;
    }

    // Convert to percentages
    const occlusion: Occlusion = {
      id: crypto.randomUUID(),
      x: (x / canvas.width) * 100,
      y: (y / canvas.height) * 100,
      width: (width / canvas.width) * 100,
      height: (height / canvas.height) * 100,
      label: `Area ${occlusions.length + 1}`,
    };

    setOcclusions([...occlusions, occlusion]);
    setIsDrawing(false);
    setDrawingRect(null);
    setSelectedOcclusion(occlusion.id);
    setEditingLabel(occlusion.label);
  };

  const handleDeleteOcclusion = (id: string) => {
    setOcclusions(occlusions.filter((occ) => occ.id !== id));
    if (selectedOcclusion === id) {
      setSelectedOcclusion(null);
      setEditingLabel('');
    }
  };

  const handleUpdateLabel = (id: string, label: string) => {
    setOcclusions(
      occlusions.map((occ) => (occ.id === id ? { ...occ, label } : occ))
    );
  };

  const handleSave = () => {
    if (!imageUrl) {
      toast.error('Please upload an image first');
      return;
    }

    if (occlusions.length === 0) {
      toast.error('Please add at least one occlusion');
      return;
    }

    // Create one flashcard for each occlusion
    const flashcards: Flashcard[] = occlusions.map((occ) => ({
      id: crypto.randomUUID(),
      type: 'image-occlusion',
      front: `Identify: ${occ.label}`,
      back: occ.label,
      imageUrl,
      occlusions: [occ], // Show only this one occlusion
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReviewDate: Date.now(),
      lastReviewed: null,
      totalReviews: 0,
      correctCount: 0,
      incorrectCount: 0,
      consecutiveFails: 0,
      isLeech: false,
    }));

    onSave(flashcards);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Image Occlusion Editor</h2>
          <p className="text-sm text-muted-foreground">
            Upload an image and draw rectangles over areas you want to memorize
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {!imageUrl ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="lg"
              className="mb-4"
            >
              <Plus className="h-5 w-5 mr-2" />
              Upload Image
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Upload diagrams, anatomy charts, maps, or any visual material
              <br />
              Max 5MB • PNG, JPG, SVG
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Canvas */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Occlusion target"
                  className="hidden"
                  onLoad={drawCanvas}
                />
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="w-full border rounded cursor-crosshair"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Click and drag to create occlusions. Each occlusion becomes one flashcard.
              </p>
            </CardContent>
          </Card>

          {/* Occlusion List */}
          {occlusions.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">
                  Occlusions ({occlusions.length})
                </h3>
                <div className="space-y-2">
                  {occlusions.map((occ) => (
                    <div
                      key={occ.id}
                      className={`flex items-center gap-2 p-2 rounded border ${
                        selectedOcclusion === occ.id
                          ? 'border-primary bg-primary/5'
                          : 'border-muted'
                      }`}
                      onClick={() => {
                        setSelectedOcclusion(occ.id);
                        setEditingLabel(occ.label);
                      }}
                    >
                      <Input
                        value={selectedOcclusion === occ.id ? editingLabel : occ.label}
                        onChange={(e) => {
                          setEditingLabel(e.target.value);
                          handleUpdateLabel(occ.id, e.target.value);
                        }}
                        className="flex-1"
                        placeholder="Label this area..."
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOcclusion(occ.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              Change Image
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={occlusions.length === 0}>
                <Save className="h-4 w-4 mr-2" />
                Create {occlusions.length} Flashcards
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
