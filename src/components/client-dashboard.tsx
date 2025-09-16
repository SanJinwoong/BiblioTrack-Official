
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Book as BookType, Checkout, Category, User, Review } from '@/lib/types';
import { BookCard } from './book-card';
import { Recommendations } from './recommendations';
import { Badge } from './ui/badge';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay"
import Fade from "embla-carousel-fade"

import { ClientHeader } from './client-header';
import { BookDetailsDialog } from './book-details-dialog';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { RestrictedView } from './restricted-view';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export function ClientDashboard() {
  const [username, setUsername] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const [books, setBooks] = useState<BookType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [checkoutRequests, setCheckoutRequests] = useState<Checkout[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [selectedBookCheckout, setSelectedBookCheckout] = useState<Checkout | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  
  useEffect(() => {
    const storedUsername = localStorage.getItem('userUsername') || '';
    setUsername(storedUsername);

    const unsubscribes = [
      onSnapshot(collection(db, 'books'), snapshot => {
        setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookType)));
      }),
      onSnapshot(collection(db, 'categories'), snapshot => 
        setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)))
      ),
      onSnapshot(collection(db, 'checkouts'), snapshot => 
        setCheckouts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Checkout)))
      ),
      onSnapshot(collection(db, 'checkoutRequests'), snapshot =>
        setCheckoutRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Checkout)))
      ),
      onSnapshot(collection(db, 'users'), snapshot => {
        const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setUsers(userList);
        
        const currentUser = userList.find((u: User) => u.username === storedUsername);
        setUser(currentUser || null);
      }),
    ];
    
    // Toast for reactivation
    if (localStorage.getItem('justReactivated') === 'true') {
        toast({
            title: '✅ ¡Bienvenido de nuevo!',
            description: 'Gracias por tu apoyo. Ya puedes seguir disfrutando de nuestra biblioteca.',
        });
        localStorage.removeItem('justReactivated');
    }

    return () => unsubscribes.forEach(unsub => unsub());
  }, [toast]);


  const handleSuccessfulCheckoutRequest = async (bookId: string, checkoutData: {userId: string; dueDate: string}) => {
    const newRequest: Omit<Checkout, 'id'> = {
      userId: checkoutData.userId,
      bookId: bookId,
      dueDate: checkoutData.dueDate,
      status: 'pending',
    };
    await addDoc(collection(db, 'checkoutRequests'), newRequest);
  };

  const handleReturnBook = () => {};
  const handleDeactivateUser = () => {};
  
  const handleOpenDialog = (book: BookType) => {
    setSelectedBook(book);
    const checkout = checkouts.find(c => c.bookId === book.id && c.userId === username && c.status === 'approved');
    const request = checkoutRequests.find(r => r.bookId === book.id && r.userId === username && r.status === 'pending');
    setSelectedBookCheckout(checkout || request || null);
  };

  const handleCloseDialog = () => {
    setSelectedBook(null);
    setSelectedBookCheckout(null);
  };

  const userCheckouts = checkouts
    .filter((c) => c.userId === username && c.status === 'approved')
    .map((c) => {
      const book = books.find((b) => b.id === c.bookId);
      return book ? { ...book, ...c } as BookType & Checkout : null;
    }).filter((b): b is BookType & Checkout => b !== null);

  const userRequests = checkoutRequests
    .filter((r) => r.userId === username)
    .map((r) => {
        const book = books.find((b) => b.id === r.bookId);
        return book ? { ...book, ...r } as BookType & Checkout : null;
    }).filter((b): b is BookType & Checkout => b !== null);

  const heroBooks = books.slice(0, 5);
  
  const booksByCategory = categories.map(category => ({
    ...category,
    books: books.filter(book => book.category === category.name).slice(0, 10)
  })).filter(category => category.books.length > 0);


  if (user && user.status === 'deactivated') {
    const userCheckoutsWithId = userCheckouts.filter((c): c is BookType & Checkout & { id: string } => !!c.id);
    return <RestrictedView user={user} checkouts={userCheckoutsWithId} />;
  }

  const handleCategorySelect = (categoryName: string | null) => {
    if (categoryName) {
      router.push(`/search?category=${encodeURIComponent(categoryName)}`);
    } else {
      setSelectedCategory(null);
    }
  };

  return (
    <>
      <BookDetailsDialog 
        book={selectedBook}
        checkout={selectedBookCheckout}
        open={!!selectedBook} 
        onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
        onSuccessfulCheckout={handleSuccessfulCheckoutRequest}
        onReturnBook={handleReturnBook} 
        onDeactivateUser={handleDeactivateUser} 
        username={username}
        role="client"
      />
      <div className="bg-background min-h-screen">
        <ClientHeader 
            username={username} 
            onSelectCategory={handleCategorySelect}
            categories={categories}
        />

        <main className="container mx-auto p-4 md:p-8 lg:p-12 space-y-16">
          <section id="hero" className="w-full">
               <Carousel 
                  opts={{ loop: true }} 
                  plugins={[Autoplay({ delay: 5000 }), Fade()]}
                  className="w-full"
              >
                  <CarouselContent className="-ml-4 h-[400px]">
                      {heroBooks.map((book, index) => (
                          <CarouselItem key={index} className="pl-4">
                               <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl">
                                  <Image
                                      src={`https://picsum.photos/seed/hero-${index + 1}/1200/400`}
                                      alt={book.title}
                                      fill
                                      className="object-cover"
                                      data-ai-hint="fantasy landscape"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                                  <div className="absolute bottom-0 left-0 p-8 text-white">
                                      <Badge variant="secondary" className="mb-2 bg-white/20 text-white backdrop-blur-sm border-0">{book.category}</Badge>
                                      <h2 className="text-4xl font-bold mb-2">{book.title}</h2>
                                      <p className="text-lg text-white/90">{book.author}</p>
                                  </div>
                              </div>
                          </CarouselItem>
                      ))}
                  </CarouselContent>
              </Carousel>
          </section>
          
          {(userCheckouts.length > 0 || userRequests.length > 0) && (
              <section id="my-activity" className="space-y-6">
                <h2 className="text-3xl font-bold">Mi Actividad</h2>
                <ScrollArea>
                    <div className="flex space-x-6 pb-4">
                    {userCheckouts.map((loan) =>
                        <div key={`checkout-${loan.id}`} className="w-44 min-w-44">
                            <BookCard book={loan as BookType} onClick={() => handleOpenDialog(loan as BookType)} isApproved={true}>
                            <div className="absolute top-2 left-2">
                                <Badge className='bg-green-100 text-green-800'>Prestado</Badge>
                            </div>
                            </BookCard>
                        </div>
                    )}
                     {userRequests.map((request) =>
                        <div key={`request-${request.id}`} className="w-44 min-w-44">
                            <BookCard book={request as BookType} onClick={() => handleOpenDialog(request as BookType)} isPending={true}>
                              <div className="absolute top-2 left-2">
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 animate-pulse">Pendiente</Badge>
                             </div>
                            </BookCard>
                        </div>
                    )}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </section>
          )}

          <Separator className="my-8"/>

          <section id="browse-categories" className="space-y-12">
            <h2 className="text-3xl font-bold text-center">Explora por Categorías</h2>
            {booksByCategory.map((category) => (
              <div key={category.id}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-semibold">{category.name}</h3>
                  <Button variant="ghost" onClick={() => handleCategorySelect(category.name)}>
                      Ver todo <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                 <Carousel opts={{ align: 'start' }} className="w-full">
                  <CarouselContent className="-ml-4">
                     {category.books.map((book) => (
                      <CarouselItem key={book.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-4">
                        <BookCard book={book} onClick={() => handleOpenDialog(book)} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
            ))}
          </section>

          <Separator className="my-8"/>

          <section id="recommendations">
              <Recommendations onBookSelect={handleOpenDialog} />
          </section>
        </main>
      </div>
    </>
  );
}
