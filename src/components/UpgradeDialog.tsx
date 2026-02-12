'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Zap,
  Infinity,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface UpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  remainingGenerations: number;
  resetsAt?: string;
}

export function UpgradeDialog({
  isOpen,
  onClose,
  remainingGenerations,
  resetsAt,
}: UpgradeDialogProps) {
  const formatResetTime = (isoString?: string) => {
    if (!isoString) return 'midnight';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const freeTierFeatures = [
    { text: '1 generation per day', included: true },
    { text: '3 AI tutor messages per day', included: true },
    { text: 'Save up to 10 study sets', included: true },
    { text: 'All flashcard features', included: true },
    { text: 'Ad-supported', included: true },
  ];

  const premiumFeatures = [
    { text: 'Unlimited generations', icon: Infinity },
    { text: 'Unlimited AI tutor messages', icon: Sparkles },
    { text: 'No ads', icon: Sparkles },
    { text: 'Unlimited saved sets', icon: Zap },
    { text: 'Export to Anki/Quizlet', icon: Download },
    { text: 'Priority processing', icon: Clock },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription>
            {remainingGenerations === 0
              ? `You've reached your daily limit! Resets at ${formatResetTime(resetsAt)}.`
              : `You have ${remainingGenerations} generation${
                  remainingGenerations === 1 ? '' : 's'
                } remaining today.`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-6">
          {/* Free Tier */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Free Tier</h3>
              <Badge variant="secondary">Current Plan</Badge>
            </div>
            <div className="space-y-3">
              {freeTierFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  {feature.included ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  )}
                  <span
                    className={
                      feature.included ? 'text-foreground' : 'text-muted-foreground'
                    }
                  >
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Tier */}
          <div className="space-y-4 border-2 border-primary rounded-lg p-4 bg-primary/5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Premium</h3>
              <Badge className="bg-primary text-primary-foreground">
                $5/month
              </Badge>
            </div>
            <div className="space-y-3">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <feature.icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="bg-muted rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium">Why upgrade?</p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Generate flashcards from unlimited PDFs and study materials</li>
            <li>Export your study sets to popular platforms like Anki and Quizlet</li>
            <li>Study distraction-free with no ads</li>
            <li>
              Get faster processing with priority access to our AI servers
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Maybe Later
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={() => {
              // TODO: Integrate Stripe payment
              alert(
                'Premium subscriptions coming soon! We\'re working on payment integration. Check back in a few days!'
              );
            }}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Upgrade Now
          </Button>
        </div>

        {/* Fine Print */}
        <p className="text-xs text-center text-muted-foreground">
          {remainingGenerations === 0
            ? `Your free tier resets at ${formatResetTime(
                resetsAt
              )}. Come back then for 1 more free generation!`
            : 'Cancel anytime. 7-day money-back guarantee.'}
        </p>
      </DialogContent>
    </Dialog>
  );
}
