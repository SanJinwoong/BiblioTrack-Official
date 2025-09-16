
'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { recommendBooks } from '@/ai/flows/recommend-books';
import { readingHistory } from '@/lib/data';
import { Sparkles, Loader2, BookHeart } from 'lucide-react';
import type { Book } from '@/lib/types';
import { BookCard } from './book-card';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface RecommendationsProps {
  onBookSelect: (book: Book) => void;
  displayStyle?: 'full' | 'compact';
}

export function Recommendations({ onBookSelect, displayStyle = 'full' }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  
  useEffect(() => {
    setUsername(localStorage.getItem('userUsername'));

    const unsubscribe = onSnapshot(collection(db, 'books'), snapshot => {
        setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book)));
    });

    return () => unsubscribe();
  }, []);

  const handleGetRecommendations = async () => {
    if (!username) {
        setError("No se pudo encontrar la información del usuario.");
        return;
    }
    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const historyUsernames = Object.keys(readingHistory);
      const userHistoryKey = historyUsernames.find(key => key === username);
      const historyIds = userHistoryKey ? readingHistory[userHistoryKey] : [];

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
        setError('No se pudieron generar recomendaciones.');
      }
    } catch (e) {
      console.error(e);
      setError('Ocurrió un error al obtener las recomendaciones.');
    } finally {
      setLoading(false);
    }
  };
  
  const recommendedBooks: Book[] = recommendations.map(title => books.find(b => b.title === title)).filter(Boolean) as Book[];

  if (displayStyle === 'compact') {
      return (
          <Card>
              <CardHeader>
                  <CardTitle className="text-xl font-bold">También te podría gustar</CardTitle>
              </CardHeader>
              <CardContent>
                  <Button onClick={handleGetRecommendations} disabled={loading || !username} className="w-full">
                      {loading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                          <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      Obtener recomendaciones
                  </Button>
                  {loading && <div className="flex justify-center items-center h-24"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
                  {error && <p className="text-destructive text-center mt-4">{error}</p>}
                  {recommendedBooks.length > 0 && (
                      <div className="space-y-4 mt-4">
                          {recommendedBooks.slice(0,3).map(book => (
                              <div key={book.id} className="flex items-center gap-3 cursor-pointer" onClick={() => onBookSelect(book)}>
                                  <Image src={book.coverUrl} alt={book.title} width={40} height={60} className="rounded-sm object-cover"/>
                                  <div>
                                      <p className="text-sm font-medium leading-tight">{book.title}</p>
                                      <p className="text-xs text-muted-foreground">{book.author}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </CardContent>
          </Card>
      )
  }

  return (
    <div className="w-full bg-muted/50 p-8 rounded-2xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 text-center md:text-left">
        <div>
          <h2 className="text-3xl font-bold flex items-center justify-center md:justify-start"><BookHeart className="mr-3 h-8 w-8 text-primary"/> Recomendaciones para ti</h2>
          <p className="text-muted-foreground mt-1">Sugerencias de la IA basadas en tu historial de lectura.</p>
        </div>
        {recommendations.length === 0 && (
             <Button onClick={handleGetRecommendations} disabled={loading || !username} className="mt-4 md:mt-0 rounded-full">
                {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                </>
                ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Obtener mis Recomendaciones
                </>
                )}
            </Button>
        )}
      </div>
      
      {loading && <div className="flex justify-center items-center h-56"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}

      {error && <p className="text-destructive text-center">{error}</p>}
      
      {recommendations.length > 0 && (
          <ScrollArea>
              <div className="flex space-x-6 pb-4">
                  {recommendedBooks.map(book => (
                      <div key={book.id} className="w-44 min-w-44">
                          <BookCard book={book} onClick={() => onBookSelect(book)} />
                      </div>
                  ))}
              </div>
              <ScrollBar orientation="horizontal" />
          </ScrollArea>
      )}

      {recommendations.length === 0 && !loading && !error && (
        <Card className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed bg-transparent shadow-none min-h-[220px]">
            <CardHeader>
                <CardTitle className="text-xl font-semibold">Descubre tu próxima lectura</CardTitle>
                <CardDescription>Haz clic en el botón para obtener recomendaciones personalizadas.</CardDescription>
            </CardHeader>
        </Card>
      )}
    </div>
  );
}
