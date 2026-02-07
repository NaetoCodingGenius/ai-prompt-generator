'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BookOpen,
  Trash2,
  Search,
  Calendar,
  FileText,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useStudyStore } from '@/store/studyStore';
import { StudySet } from '@/types/studyset';
import toast from 'react-hot-toast';

interface StudySetListProps {
  onSelectSet: (set: StudySet) => void;
  selectedSetId: string | null;
}

export function StudySetList({ onSelectSet, selectedSetId }: StudySetListProps) {
  const { studySets, deleteStudySet } = useStudyStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter study sets based on search query
  const filteredSets = studySets.filter((set) => {
    const query = searchQuery.toLowerCase();
    return (
      set.title.toLowerCase().includes(query) ||
      set.description?.toLowerCase().includes(query) ||
      set.sourceName.toLowerCase().includes(query)
    );
  });

  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Handle delete with confirmation
  const handleDelete = (setId: string, title: string) => {
    if (deletingId === setId) {
      // Second click - confirm delete
      deleteStudySet(setId);
      toast.success(`Deleted "${title}"`);
      setDeletingId(null);
    } else {
      // First click - show confirmation
      setDeletingId(setId);
      toast('Click delete again to confirm', {
        icon: '⚠️',
        duration: 3000,
      });

      // Reset confirmation after 3 seconds
      setTimeout(() => {
        setDeletingId(null);
      }, 3000);
    }
  };

  // Get icon based on source type
  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'screenshot':
        return <FileText className="h-4 w-4" />;
      case 'youtube':
        return <FileText className="h-4 w-4" />;
      case 'voice':
        return <FileText className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            My Study Sets
          </h2>
          <span className="text-sm text-muted-foreground">{studySets.length}</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search study sets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Study Sets List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredSets.length === 0 ? (
            <div className="text-center py-12">
              {searchQuery ? (
                <>
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No study sets found matching &quot;{searchQuery}&quot;
                  </p>
                </>
              ) : (
                <>
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-2">
                    No study sets yet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Upload a PDF to create your first study set
                  </p>
                </>
              )}
            </div>
          ) : (
            filteredSets.map((set) => (
              <Card
                key={set.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedSetId === set.id
                    ? 'border-primary bg-primary/5'
                    : 'border-muted'
                }`}
                onClick={() => onSelectSet(set)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base line-clamp-1">
                        {set.title}
                      </CardTitle>
                      {set.description && (
                        <CardDescription className="text-xs line-clamp-1 mt-1">
                          {set.description}
                        </CardDescription>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 flex-shrink-0 ${
                        deletingId === set.id
                          ? 'text-destructive hover:text-destructive'
                          : 'text-muted-foreground'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(set.id, set.title);
                      }}
                    >
                      {deletingId === set.id ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Source Info */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {getSourceIcon(set.sourceType)}
                    <span className="line-clamp-1">{set.sourceName}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <BookOpen className="h-3 w-3" />
                      <span>{set.flashcards.length} cards</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(set.createdAt)}</span>
                    </div>
                  </div>

                  {/* Processing Info */}
                  {set.metadata && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1 border-t">
                      <Clock className="h-3 w-3" />
                      <span>
                        {(set.metadata.processingTime / 1000).toFixed(1)}s •{' '}
                        {set.metadata.tokensUsed.toLocaleString()} tokens
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
