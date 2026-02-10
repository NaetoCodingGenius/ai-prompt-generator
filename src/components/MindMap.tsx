'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flashcard } from '@/types/studyset';
import { Network, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  connections: string[];
  color: string;
}

interface MindMapProps {
  flashcards: Flashcard[];
  title?: string;
}

export function MindMap({ flashcards, title }: MindMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    generateMindMap();
  }, [flashcards]);

  useEffect(() => {
    if (nodes.length > 0) {
      drawMindMap();
    }
  }, [nodes, zoom, offset, selectedNode]);

  const generateMindMap = () => {
    if (!flashcards || flashcards.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Extract keywords from flashcards to find connections
    const generatedNodes: Node[] = flashcards.map((card, index) => {
      const angle = (index / flashcards.length) * 2 * Math.PI;
      const radius = 150 + (index % 3) * 50;

      return {
        id: card.id,
        label: card.front.slice(0, 30) + (card.front.length > 30 ? '...' : ''),
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        connections: findConnections(card, flashcards),
        color: getColorByMastery(card),
      };
    });

    setNodes(generatedNodes);
  };

  const findConnections = (card: Flashcard, allCards: Flashcard[]): string[] => {
    const connections: string[] = [];
    const cardWords = extractKeywords(card.front + ' ' + card.back);

    allCards.forEach((otherCard) => {
      if (otherCard.id === card.id) return;

      const otherWords = extractKeywords(otherCard.front + ' ' + otherCard.back);
      const commonWords = cardWords.filter((word) => otherWords.includes(word));

      // If they share 2+ keywords, they're connected
      if (commonWords.length >= 2) {
        connections.push(otherCard.id);
      }
    });

    return connections;
  };

  const extractKeywords = (text: string): string[] => {
    // Remove common words (stopwords)
    const stopwords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'what', 'which', 'who', 'when', 'where', 'why', 'how'];

    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopwords.includes(word));
  };

  const getColorByMastery = (card: Flashcard): string => {
    if (card.totalReviews === 0) return '#94a3b8'; // New - gray
    if (card.interval >= 21 && card.easeFactor >= 2.5) return '#10b981'; // Mastered - green
    if (card.interval >= 7) return '#3b82f6'; // Review - blue
    if (card.incorrectCount > card.correctCount) return '#ef4444'; // Struggling - red
    return '#f59e0b'; // Learning - orange
  };

  const drawMindMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Apply zoom and offset
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    // Draw connections first (so they're behind nodes)
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    nodes.forEach((node) => {
      node.connections.forEach((connId) => {
        const connNode = nodes.find((n) => n.id === connId);
        if (connNode) {
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(connNode.x, connNode.y);
          ctx.stroke();
        }
      });
    });

    // Draw nodes
    nodes.forEach((node) => {
      const isSelected = selectedNode === node.id;

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, isSelected ? 35 : 30, 0, 2 * Math.PI);
      ctx.fillStyle = node.color;
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#1e293b' : '#fff';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#1e293b';
      ctx.font = isSelected ? 'bold 13px sans-serif' : '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + (isSelected ? 50 : 45));
    });

    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / zoom;
    const y = (e.clientY - rect.top - offset.y) / zoom;

    // Check if clicking on a node
    const clickedNode = nodes.find((node) => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= 30;
    });

    if (clickedNode) {
      setSelectedNode(selectedNode === clickedNode.id ? null : clickedNode.id);
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.2, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  const getSelectedCardDetails = () => {
    if (!selectedNode) return null;
    const card = flashcards.find((c) => c.id === selectedNode);
    if (!card) return null;

    const node = nodes.find((n) => n.id === selectedNode);
    const connectedCards = flashcards.filter((c) => node?.connections.includes(c.id));

    return { card, connectedCards };
  };

  const details = getSelectedCardDetails();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          {title || 'Knowledge Map'}
        </CardTitle>
        <CardDescription>
          Visualize connections between concepts • Click nodes to explore
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#94a3b8]"></div>
              <span>New</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
              <span>Learning</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
              <span>Review</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
              <span>Mastered</span>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full border rounded cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* Selected Node Details */}
        {details && (
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div>
              <div className="font-medium mb-1">{details.card.front}</div>
              <div className="text-sm text-muted-foreground">{details.card.back}</div>
            </div>
            {details.connectedCards.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">
                  Connected Concepts ({details.connectedCards.length})
                </div>
                <div className="space-y-1">
                  {details.connectedCards.slice(0, 3).map((card) => (
                    <div key={card.id} className="text-xs text-muted-foreground">
                      • {card.front}
                    </div>
                  ))}
                  {details.connectedCards.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      ...and {details.connectedCards.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
