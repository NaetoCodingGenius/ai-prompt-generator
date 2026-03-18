'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import { MenuItem } from '@/types/menu';
import toast from 'react-hot-toast';

interface MenuUploadProps {
  onAnalysisComplete: (menuItems: MenuItem[]) => void;
}

export function MenuUpload({ onAnalysisComplete }: MenuUploadProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: crypto.randomUUID(), name: '', category: '', price: 0, ingredientCost: 0 }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const addMenuItem = () => {
    setMenuItems([...menuItems, {
      id: crypto.randomUUID(),
      name: '',
      category: '',
      price: 0,
      ingredientCost: 0
    }]);
  };

  const removeMenuItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const updateMenuItem = (id: string, field: keyof MenuItem, value: string | number) => {
    setMenuItems(menuItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleAnalyze = async () => {
    // Validate
    const validItems = menuItems.filter(item =>
      item.name.trim() && item.price > 0 && item.ingredientCost > 0
    );

    if (validItems.length === 0) {
      toast.error('Please add at least one complete menu item');
      return;
    }

    if (validItems.length < 3) {
      toast.error('Please add at least 3 menu items for meaningful analysis');
      return;
    }

    setIsAnalyzing(true);
    const loadingToast = toast.loading(`AI analyzing ${validItems.length} menu items...`);

    try {
      // Call AI API
      const response = await fetch('/api/analyze-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ menuItems: validItems }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      toast.success('AI analysis complete!', { id: loadingToast });

      // Pass results to parent component
      onAnalysisComplete(validItems);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to analyze menu. Please try again.',
        { id: loadingToast }
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSampleMenu = () => {
    setMenuItems([
      { id: crypto.randomUUID(), name: 'Margherita Pizza', category: 'Pizza', price: 14, ingredientCost: 3.50 },
      { id: crypto.randomUUID(), name: 'Pepperoni Pizza', category: 'Pizza', price: 16, ingredientCost: 4.20 },
      { id: crypto.randomUUID(), name: 'Caesar Salad', category: 'Salads', price: 12, ingredientCost: 2.80 },
      { id: crypto.randomUUID(), name: 'Chicken Alfredo', category: 'Pasta', price: 18, ingredientCost: 5.50 },
      { id: crypto.randomUUID(), name: 'Lasagna', category: 'Pasta', price: 17, ingredientCost: 6.20 },
      { id: crypto.randomUUID(), name: 'Tiramisu', category: 'Desserts', price: 8, ingredientCost: 2.10 },
      { id: crypto.randomUUID(), name: 'Garlic Bread', category: 'Appetizers', price: 6, ingredientCost: 1.20 },
      { id: crypto.randomUUID(), name: 'Bruschetta', category: 'Appetizers', price: 9, ingredientCost: 2.40 },
    ]);
    toast.success('Sample menu loaded!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enter Your Menu Items</CardTitle>
          <CardDescription>
            Add your menu items with their selling price and ingredient cost.
            We'll calculate profit margins and give you recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Quick tip:</strong> Try our sample menu first to see how it works!{' '}
              <Button
                variant="link"
                className="h-auto p-0 text-emerald-600"
                onClick={loadSampleMenu}
              >
                Load sample menu
              </Button>
            </AlertDescription>
          </Alert>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 font-medium text-sm text-slate-700 px-2">
            <div className="col-span-3">Menu Item</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Price ($)</div>
            <div className="col-span-3">Ingredient Cost ($)</div>
            <div className="col-span-2">Actions</div>
          </div>

          {/* Menu Items */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-slate-50 rounded-lg">
                <input
                  type="text"
                  className="col-span-3 px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Margherita Pizza"
                  value={item.name}
                  onChange={(e) => updateMenuItem(item.id, 'name', e.target.value)}
                />
                <input
                  type="text"
                  className="col-span-2 px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Pizza"
                  value={item.category}
                  onChange={(e) => updateMenuItem(item.id, 'category', e.target.value)}
                />
                <input
                  type="number"
                  step="0.01"
                  className="col-span-2 px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="16.00"
                  value={item.price || ''}
                  onChange={(e) => updateMenuItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                />
                <input
                  type="number"
                  step="0.01"
                  className="col-span-3 px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="4.50"
                  value={item.ingredientCost || ''}
                  onChange={(e) => updateMenuItem(item.id, 'ingredientCost', parseFloat(e.target.value) || 0)}
                />
                <div className="col-span-2 flex gap-1">
                  {menuItems.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMenuItem(item.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add More Button */}
          <Button
            variant="outline"
            onClick={addMenuItem}
            className="w-full border-dashed border-2 hover:border-emerald-500 hover:bg-emerald-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Menu Item
          </Button>

          {/* Analyze Button */}
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Analyze My Menu
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
