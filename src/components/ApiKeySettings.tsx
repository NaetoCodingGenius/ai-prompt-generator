'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Key, Zap, Lock, Unlock } from 'lucide-react';
import toast from 'react-hot-toast';

interface ApiKeySettingsProps {
  onApiKeyChange?: (apiKey: string | null) => void;
}

export function ApiKeySettings({ onApiKeyChange }: ApiKeySettingsProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has saved API key
    const savedKey = localStorage.getItem('user_anthropic_key');
    if (savedKey) {
      setHasApiKey(true);
      setApiKey(savedKey);
      onApiKeyChange?.(savedKey);
    }
  }, [onApiKeyChange]);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    if (!apiKey.startsWith('sk-ant-')) {
      toast.error('Invalid API key format. Should start with sk-ant-');
      return;
    }

    localStorage.setItem('user_anthropic_key', apiKey);
    setHasApiKey(true);
    onApiKeyChange?.(apiKey);
    setIsOpen(false);
    toast.success('API key saved! You can now generate prompts.');
  };

  const handleRemoveKey = () => {
    localStorage.removeItem('user_anthropic_key');
    setApiKey('');
    setHasApiKey(false);
    onApiKeyChange?.(null);
    toast.success('API key removed.');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={hasApiKey ? "outline" : "default"} size="sm">
          {hasApiKey ? (
            <>
              <Key className="h-4 w-4 mr-2" />
              API Key Active
            </>
          ) : (
            <>
              <Key className="h-4 w-4 mr-2" />
              Add API Key
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Required
          </DialogTitle>
          <DialogDescription>
            {hasApiKey
              ? 'Your API key is securely stored in your browser only.'
              : 'Add your Anthropic API key to start generating prompts. It\'s free to get started!'}
          </DialogDescription>
        </DialogHeader>

        {!hasApiKey ? (
          <div className="space-y-4">
            <Card className="border-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Get Started - 100% Free
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p className="font-semibold">Quick Setup (2 minutes):</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Generate as many prompts as you want</li>
                    <li>Powered by Claude Opus 4 (best model)</li>
                    <li>Your key stays private (stored locally only)</li>
                    <li>Free $5 credit from Anthropic to start</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Anthropic API Key</label>
                  <Input
                    type="password"
                    placeholder="sk-ant-api03-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Get your API key (free $5 credit) at{' '}
                    <a
                      href="https://console.anthropic.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      console.anthropic.com
                    </a>
                  </p>
                </div>

                <Button onClick={handleSaveKey} className="w-full">
                  Save & Start Generating
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="border-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                  <Zap className="h-4 w-4" />
                  Ready to Generate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Your API key is active and securely stored in your browser only. Start generating prompts!
                </p>
                <Button onClick={handleRemoveKey} variant="outline" className="w-full">
                  Remove API Key
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
