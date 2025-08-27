'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { recommendBooks } from '@/ai/flows/recommend-books';
import { books, readingHistory } from '@/lib/data';
import { Sparkles, Loader2, BookHeart } from 'lucide-react';
import type { Book } from '@/lib/types';
import { BookCard } from './book-card';


export function Recommendations() {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  useEffect(() => {
    setUserEmail(localStorage.getItem('userEmail'));
  }, []);

  const handleGetRecommendations = async () => {
    if (!userEmail) {
        setError("Could not find user information.");
        return;
    }
    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const historyIds = readingHistory[userEmail] || [];
      const userHistoryTitles = historyIds.map(id => books.find(b => b.id === id)?.title).filter(Boolean) as string[];
      const inventoryTitles = books.filter(b => b.available).map(b => b.title);

      const result = await recommendBooks({
        readingHistory: userHistoryTitles,
        currentCheckouts: [], // Not used in prompt, but can be added
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline flex items-center"><BookHeart className="mr-2 h-6 w-6 text-primary"/> AI-Powered Recommendations</CardTitle>
        <CardDescription>
          Based on your reading history, here are some books you might like that are currently available.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        {recommendations.length === 0 && !loading && (
             <Button onClick={handleGetRecommendations} disabled={loading || !userEmail}>
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

        {loading && <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />}

        {error && <p className="text-destructive">{error}</p>}
        
        {recommendations.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 text-left">
                {recommendedBooks.map(book => (
                    <BookCard key={book.id} book={book} />
                ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
