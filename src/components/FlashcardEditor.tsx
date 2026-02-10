'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flashcard } from '@/types/studyset';
import { Trash2, Plus, Save, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';

interface FlashcardEditorProps {
  flashcards: Flashcard[];
  onUpdate: (flashcards: Flashcard[]) => void;
  onSave: () => void;
}

export function FlashcardEditor({ flashcards, onUpdate, onSave }: FlashcardEditorProps) {
  const [editingCards, setEditingCards] = useState<Flashcard[]>(flashcards);

  const updateCard = (index: number, field: 'front' | 'back', value: string) => {
    const updated = [...editingCards];
    updated[index] = { ...updated[index], [field]: value };
    setEditingCards(updated);
    onUpdate(updated);
  };

  const deleteCard = (index: number) => {
    const updated = editingCards.filter((_, i) => i !== index);
    setEditingCards(updated);
    onUpdate(updated);
    toast.success('Flashcard deleted');
  };

  const addCard = () => {
    const newCard: Flashcard = {
      id: crypto.randomUUID(),
      type: 'normal',
      front: '',
      back: '',
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
    };
    const updated = [...editingCards, newCard];
    setEditingCards(updated);
    onUpdate(updated);
    toast.success('New flashcard added');
  };

  const handleSave = () => {
    // Validate that at least one card has content
    const validCards = editingCards.filter(card => card.front.trim() && card.back.trim());

    if (validCards.length === 0) {
      toast.error('Please fill in at least one flashcard');
      return;
    }

    if (validCards.length < editingCards.length) {
      toast.error(`${editingCards.length - validCards.length} empty flashcards will be removed`);
      onUpdate(validCards);
      setEditingCards(validCards);
    }

    onSave();
  };

  const filledCount = editingCards.filter(card => card.front.trim() && card.back.trim()).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Edit Your Flashcards</h3>
          <p className="text-sm text-muted-foreground">
            {filledCount} of {editingCards.length} cards completed
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={addCard} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Card
          </Button>
          <Button onClick={handleSave} size="sm" disabled={filledCount === 0}>
            <Save className="h-4 w-4 mr-2" />
            Save & Continue
          </Button>
        </div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {editingCards.map((card, index) => (
          <Card key={card.id} className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  Card {index + 1}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteCard(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Front (Question/Term)
                </label>
                <Input
                  placeholder="e.g., What is photosynthesis?"
                  value={card.front}
                  onChange={(e) => updateCard(index, 'front', e.target.value)}
                  className="font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Back (Answer/Definition)
                </label>
                <Textarea
                  placeholder="e.g., The process by which plants convert light energy into chemical energy..."
                  value={card.back}
                  onChange={(e) => updateCard(index, 'back', e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingCards.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">No flashcards yet</p>
            <Button onClick={addCard} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Card
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
