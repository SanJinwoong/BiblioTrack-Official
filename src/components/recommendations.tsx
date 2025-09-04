'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { recommendBooks } from '@/ai/flows/recommend-books';
import { books, readingHistory } from '@/lib/data';
import { Sparkles, Loader2, BookHeart } from 'lucide-react';
import type { Book } from '@/lib/types';
import { BookCard } from './book-card';
import { ScrollArea, ScrollBar } from './ui/scroll-area';

interface RecommendationsProps {
  onBookSelect: (book: Book) => void;
}

export function Recommendations({ onBookSelect }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  
  useEffect(() => {
    setUsername(localStorage.getItem('userUsername'));
  }, []);

  const handleGetRecommendations = async () => {
    if (!username) {
        setError("Could not find user information.");
        return;
    }
    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const historyIds = readingHistory[username] || [];
      const userHistoryTitles = historyIds.map(id => books.find(b => b.id === id)?.title).filter(Boolean) as string[];
      const inventoryTitles = books.filter(b => b.stock > 0).map(b => b.title);

      const result = await recommendBooks({
        readingHistory: userHistoryTitles,
        currentCheckouts: [],
        inventory: inventoryTitles,
      });

      if (result.recommendations) {
        setRecommendations(result.recommendations);
      } else {
        setError('Could not generate recommendations.');
      }
    } catch (e) {
      console.error(e);
      setError('An error occurred while fetching recommendations.');
    } finally {
      setLoading(false);
    }
  };
  
  const recommendedBooks: Book[] = recommendations.map(title => books.find(b => b.title === title)).filter(Boolean) as Book[];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold font-headline flex items-center"><BookHeart className="mr-2 h-6 w-6 text-primary"/> AI-Powered Recommendations</h2>
        {recommendations.length === 0 && (
             <Button onClick={handleGetRecommendations} disabled={loading || !username}>
                {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                </>
                ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get My Recommendations
                </>
                )}
            </Button>
        )}
      </div>
      
      {loading && <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}

      {error && <p className="text-destructive">{error}</p>}
      
      {recommendations.length > 0 && (
          <ScrollArea>
              <div className="flex space-x-4 pb-4">
                  {recommendedBooks.map(book => (
                      <div key={book.id} className="w-40 min-w-40">
                          <BookCard book={book} onClick={() => onBookSelect(book)} />
                      </div>
                  ))}
              </div>
              <ScrollBar orientation="horizontal" />
          </ScrollArea>
      )}

      {recommendations.length === 0 && !loading && !error && (
        <Card className="flex flex-col items-center justify-center text-center p-8 border-dashed">
            <CardHeader>
                <CardTitle>Discover your next read</CardTitle>
                <CardDescription>Click the button to get personalized book recommendations based on your reading history.</CardDescription>
            </CardHeader>
        </Card>
      )}
    </div>
  );
}
