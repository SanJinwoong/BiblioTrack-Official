
'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { readingHistory } from '@/lib/data';
import { Sparkles, Loader2, BookHeart } from 'lucide-react';
import type { Book } from '@/lib/types';
import { getBookCoverUrl } from '@/lib/utils';
import { BookCard } from './book-card';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { getBooks } from '@/lib/supabase-functions';
import Image from 'next/image';

interface RecommendationsProps {
  onBookSelect: (book: Book) => void;
  displayStyle?: 'full' | 'compact';
}

export function Recommendations({ onBookSelect, displayStyle = 'full' }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  
  useEffect(() => {
    setUsername(localStorage.getItem('userUsername'));
    
    const loadBooks = async () => {
      try {
        const booksData = await getBooks();
        setBooks(booksData);
      } catch (error) {
        console.error('Error loading books:', error);
        setError('Error al cargar los libros.');
      }
    };

    loadBooks();
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
      const availableBookTitles = books.filter(b => b.stock > 0).map(b => b.title);

      console.log('🚀 Enviando solicitud a API route...');
      
      // Llamar a nuestra API route en lugar de Gemini directamente
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          readingHistory: userHistoryTitles,
          currentCheckouts: [],
          availableBooks: availableBookTitles,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.recommendations) {
        setRecommendations(result.recommendations);
        setError(null);
        console.log('✅ Recomendaciones recibidas:', result.recommendations.length);
      } else {
        setError('No se pudieron generar recomendaciones.');
      }
    } catch (e) {
      console.error('❌ Error obteniendo recomendaciones:', e);
      setError('Error de conexión con el servicio de IA. Inténtalo más tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  // Mapear recomendaciones a libros existentes o crear tarjetas temporales
  const recommendedBooks: (Book & { reason?: string })[] = recommendations.map(rec => {
    // Buscar si el libro existe en la biblioteca
    const existingBook = books.find(b => b.title.toLowerCase().includes(rec.title.toLowerCase()));
    
    if (existingBook) {
      return { ...existingBook, reason: rec.reason };
    } else {
      // Crear una tarjeta temporal para libros que no están en la biblioteca
      return {
        id: `temp-${rec.title}`,
        title: rec.title,
        author: rec.author,
        description: rec.reason,
        category: 'Recomendación de IA',
        stock: 0, // No disponible en biblioteca
        coverUrl: '', // Placeholder
        reason: rec.reason
      };
    }
  }).filter(Boolean);

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
                              <div key={book.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                                  <Image 
                                    src={book.coverUrl || getBookCoverUrl(book)} 
                                    alt={book.title} 
                                    width={40} 
                                    height={60} 
                                    className="rounded-sm object-cover flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium leading-tight">{book.title}</p>
                                      <p className="text-xs text-muted-foreground mb-1">{book.author}</p>
                                      {book.reason && (
                                        <p className="text-xs text-primary/80 italic">{book.reason}</p>
                                      )}
                                      {book.stock === 0 && (
                                        <span className="inline-block text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full mt-1">
                                          No disponible en biblioteca
                                        </span>
                                      )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedBooks.map(book => (
                  <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-[3/4] relative">
                      <Image 
                        src={book.coverUrl || getBookCoverUrl(book)} 
                        alt={book.title}
                        fill
                        className="object-cover"
                      />
                      {book.stock === 0 && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                            No disponible
                          </span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2">{book.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{book.author}</p>
                      {book.reason && (
                        <p className="text-xs text-primary/80 italic mb-3 line-clamp-2">{book.reason}</p>
                      )}
                      {book.stock > 0 && (
                        <Button 
                          size="sm" 
                          className="w-full" 
                          onClick={() => onBookSelect(book)}
                        >
                          Ver detalles
                        </Button>
                      )}
                    </CardContent>
                  </Card>
              ))}
          </div>
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
