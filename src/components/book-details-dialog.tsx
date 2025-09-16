

import Image from 'next/image';
import { differenceInDays, parseISO, isPast, formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Book, Checkout, User as UserType, Review } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { User, Calendar, AlertCircle, MoreHorizontal, Bell, Check, FolderKanban, BookCheck, Loader2, MessageSquare, Heart } from 'lucide-react';
import { CheckoutForm } from './checkout-form';
import { useEffect, useState } from 'react';
import { UserDetailsTooltip } from './user-details-tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { StarRating } from './star-rating';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ReviewCard } from './review-card';

interface BookDetailsDialogProps {
  book: Book | null;
  checkout?: Checkout | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccessfulCheckout: (bookId: string, checkoutData: {userId: string; dueDate: string}) => void;
  onApproveRequest?: (checkout: Checkout) => void;
  onReturnBook: (checkout: Checkout) => void;
  onDeactivateUser: (userId: string) => void;
  username: string;
  role: 'client' | 'librarian';
}

export function BookDetailsDialog({ book, checkout, open, onOpenChange, onSuccessfulCheckout, onApproveRequest, onReturnBook, onDeactivateUser, username, role }: BookDetailsDialogProps) {
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (!book?.id) return;
    
    const reviewsUnsubscribe = onSnapshot(collection(db, 'reviews'), (snapshot) => {
        const allReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        setReviews(allReviews.filter(r => r.bookId === book.id));
    });

    const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
        const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserType));
        setUsers(allUsers);
        const foundUser = allUsers.find(u => u.username === username);
        setCurrentUser(foundUser || null);
    });

    return () => {
        reviewsUnsubscribe();
        usersUnsubscribe();
    }
  }, [book?.id, username]);

  if (!book) {
    return null;
  }
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setShowCheckoutForm(false);
      setIsProcessing(false);
      setNewRating(0);
      setNewComment('');
    }
    onOpenChange(isOpen);
  };
  
  const handleReviewSubmit = async () => {
    if (newRating === 0 || !newComment.trim()) {
        toast({
            variant: 'destructive',
            title: 'Campos incompletos',
            description: 'Por favor, selecciona una calificación y escribe un comentario.',
        });
        return;
    }
    
    const reviewData: Omit<Review, 'id'> = {
        bookId: book.id,
        userId: username,
        rating: newRating,
        comment: newComment,
        date: new Date().toISOString(),
    };

    try {
        await addDoc(collection(db, 'reviews'), reviewData);
        toast({
            title: '✅ Reseña enviada',
            description: '¡Gracias por tu opinión!',
        });
        setNewComment('');
        setNewRating(0);
    } catch (error) {
        console.error("Error submitting review:", error);
        toast({
            variant: 'destructive',
            title: 'Error al enviar',
            description: 'No se pudo guardar tu reseña. Inténtalo de nuevo.',
        });
    }
  };


  const handleSuccessfulCheckout = (checkoutData: {userId: string; dueDate: string}) => {
    if(!book) return;
    onSuccessfulCheckout(book.id, checkoutData);
    setShowCheckoutForm(false);
    onOpenChange(false); 
  }

  const handleApprove = () => {
    if (checkout && onApproveRequest) {
      setIsProcessing(true); 
      onApproveRequest(checkout);
      handleOpenChange(false);
    }
  }

  const handleReturn = () => {
    if (checkout) {
      onReturnBook(checkout);
      handleOpenChange(false);
    }
  }

  const handleToggleFavorite = async () => {
    if (!currentUser || !book) return;
    
    const userRef = doc(db, 'users', currentUser.id);
    const isFavorite = currentUser.favoriteBooks?.includes(book.title);

    try {
        if (isFavorite) {
            await updateDoc(userRef, { favoriteBooks: arrayRemove(book.title) });
            toast({ description: `"${book.title}" eliminado de tus favoritos.` });
        } else {
            await updateDoc(userRef, { favoriteBooks: arrayUnion(book.title) });
            toast({ description: `"${book.title}" añadido a tus favoritos.` });
        }
    } catch (error) {
        console.error("Error updating favorites:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar tus favoritos.' });
    }
  };

  const getStockStatus = () => {
    let text;
    let color;

    if (book.stock === 0) {
        text = 'Agotado';
        color = 'bg-gray-100 text-gray-600';
    } else if (book.stock <= 3) {
        text = `Disponible ${book.stock}`;
        color = 'bg-yellow-100 text-yellow-800';
    } else {
        text = `Disponible ${book.stock}`;
        color = 'bg-green-100 text-green-800';
    }
    
    return { text, color };
  };

  const getDueDateStatus = () => {
    if (!checkout || checkout.status !== 'approved') return null;
    
    const dueDate = parseISO(checkout.dueDate);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (isPast(dueDate)) {
       const distance = formatDistanceToNowStrict(dueDate, { addSuffix: true, locale: es });
      return { text: `Vencido ${distance}`, color: 'text-red-600 font-semibold', isOverdue: true };
    }
    
    const daysDiff = differenceInDays(dueDate, today);

    if (daysDiff <= 3) {
        return { text: `Vence en ${daysDiff + 1} día(s)`, color: 'text-yellow-600 font-semibold', isAtRisk: true };
    }
    return { text: `Vence el ${checkout.dueDate}`, color: 'text-muted-foreground' };
  };

  const stockStatus = getStockStatus();
  const dueDateStatus = getDueDateStatus();
  const isRequestByThisUser = checkout?.status === 'pending' && checkout?.userId === username;
  const isPendingRequestForLibrarian = checkout?.status === 'pending';
  const isLoanForLibrarian = checkout?.status === 'approved';
  
  const reviewsWithUserData = reviews.map(review => {
      const user = users.find(u => u.username === review.userId);
      return { ...review, user };
  });
  
  const userHasReviewed = reviews.some(r => r.userId === username);
  const isFavorite = currentUser?.favoriteBooks?.includes(book.title);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[650px] grid grid-cols-1 md:grid-cols-[200px_1fr] p-0 max-h-[90vh] h-full">
        <div className="hidden md:flex items-start justify-center p-6 pr-0">
          <div className="relative aspect-[3/4.5] w-full rounded-md overflow-hidden">
            <Image
              src={book.coverUrl}
              alt={`Cover of ${book.title}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 30vw, 200px"
            />
          </div>
        </div>

        <div className="flex flex-col h-full overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="font-headline text-2xl mb-1">{book.title}</DialogTitle>
                <DialogDescription className="text-base">{book.author}</DialogDescription>
              </div>
              {role === 'client' && (
                <Button variant="ghost" size="icon" onClick={handleToggleFavorite} className="shrink-0">
                    <Heart className={cn("h-6 w-6", isFavorite ? "text-red-500 fill-red-500" : "text-muted-foreground")} />
                </Button>
              )}
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="details" className="h-full flex flex-col">
                <TabsList className="mx-6 mt-4">
                    <TabsTrigger value="details">Detalles</TabsTrigger>
                    <TabsTrigger value="reviews">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Reseñas ({reviews.length})
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="flex-1 px-6 pb-6">
                    {showCheckoutForm ? (
                      <CheckoutForm
                        book={book}
                        username={username}
                        role={role}
                        onSuccess={handleSuccessfulCheckout}
                        onCancel={() => setShowCheckoutForm(false)}
                      />
                    ) : (
                      <>
                        {isPendingRequestForLibrarian && role === 'librarian' && (
                            <div className="mb-4 flex items-center p-3 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                                <Bell className="h-5 w-5 mr-3 shrink-0" />
                                <div>
                                    <h4 className="font-bold">Solicitud Pendiente</h4>
                                    <p className="text-sm">El usuario <strong>{checkout.userId}</strong> ha solicitado este libro. Fecha de entrega propuesta: {checkout.dueDate}.</p>
                                </div>
                           </div>
                        )}

                        {dueDateStatus?.isOverdue && role === 'client' && (
                             <div className="mb-4 flex items-center p-3 rounded-md bg-red-50 text-red-800 border border-red-200">
                                <AlertCircle className="h-5 w-5 mr-3 shrink-0" />
                                <div>
                                    <h4 className="font-bold">Préstamo Vencido</h4>
                                    <p className="text-sm">Este préstamo ha vencido. Por favor, devuelve el libro lo antes posible para evitar la desactivación de tu cuenta.</p>
                                </div>
                           </div>
                        )}
                        
                        {dueDateStatus?.isAtRisk && role === 'client' && (
                             <div className="mb-4 flex items-center p-3 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200">
                                <AlertCircle className="h-5 w-5 mr-3 shrink-0" />
                                <div>
                                    <h4 className="font-bold">Préstamo por Vencer</h4>
                                    <p className="text-sm">Recuerda devolver este libro pronto. Tu cuenta podría ser desactivada si no lo haces a tiempo.</p>
                                </div>
                           </div>
                        )}
                        
                        {isRequestByThisUser && role === 'client' && (
                             <div className="mb-4 flex items-center p-3 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200">
                                <Bell className="h-5 w-5 mr-3 shrink-0 animate-pulse" />
                                <div>
                                    <h4 className="font-bold">Solicitud Pendiente</h4>
                                    <p className="text-sm">Tu solicitud está pendiente de aprobación por el bibliotecario. Se te notificará cuando sea aprobada.</p>
                                </div>
                           </div>
                        )}

                        <div className="text-sm text-muted-foreground mb-4">
                          <p>{book.description}</p>
                        </div>
                         <div className="flex items-center space-x-2 my-4">
                          <FolderKanban className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-sm">Categoría:</span>
                          <Badge variant="secondary">{book.category}</Badge>
                        </div>
                        <div className="flex items-center space-x-2 my-4">
                          <span className="font-semibold text-sm">Disponibilidad:</span>
                          <Badge className={cn("text-xs font-semibold", stockStatus.color)}>
                            {stockStatus.text}
                          </Badge>
                        </div>

                        {checkout && checkout.status === 'approved' && (
                          <div className="mt-2 space-y-2 text-sm">
                            <div className="flex items-center">
                              <User className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="font-semibold mr-2">Prestado a:</span>
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="truncate">{checkout.userId}</span>
                                <UserDetailsTooltip userId={checkout.userId}>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </UserDetailsTooltip>
                              </div>
                            </div>
                            {dueDateStatus && (
                                <div className="flex items-center">
                                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span className="font-semibold">Fecha de entrega:</span>
                                    <span className={cn("ml-2", dueDateStatus.color)}>{dueDateStatus.text}</span>
                                </div>
                            )}
                          </div>
                        )}
                        {book.stock === 0 && !checkout && (
                          <div className="mt-4 flex items-center p-3 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200">
                            <AlertCircle className="h-5 w-5 mr-3" />
                            <span className="text-sm">Este libro no está disponible actualmente.</span>
                          </div>
                        )}
                      </>
                    )}
                </TabsContent>
                 <TabsContent value="reviews" className="flex-1 px-6 pb-6 space-y-6">
                    {role === 'client' && !userHasReviewed && (
                        <div className='p-4 border rounded-lg bg-background space-y-3'>
                             <h4 className='font-semibold'>Deja tu opinión</h4>
                             <div className='flex items-center gap-2'>
                                 <span className='text-sm text-muted-foreground'>Tu calificación:</span>
                                 <StarRating rating={newRating} onRatingChange={setNewRating} />
                             </div>
                             <Textarea 
                                placeholder='Escribe tu reseña aquí...'
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                rows={3}
                             />
                             <div className='flex justify-end'>
                                 <Button size="sm" onClick={handleReviewSubmit}>Enviar Reseña</Button>
                             </div>
                        </div>
                    )}
                    {reviewsWithUserData.length > 0 ? (
                        <div className="space-y-4">
                            {reviewsWithUserData.map(review => (
                                <ReviewCard key={review.id} review={review} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>Este libro aún no tiene reseñas. ¡Sé el primero en dejar una!</p>
                        </div>
                    )}
                 </TabsContent>
            </Tabs>
          </div>
          
          
            <DialogFooter className="p-6 border-t bg-background">
                {role === 'librarian' && isPendingRequestForLibrarian && !showCheckoutForm && (
                     <Button type="button" disabled={book.stock === 0 || isProcessing} onClick={handleApprove}>
                        {isProcessing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Check className="mr-2 h-4 w-4" />
                        )}
                        {isProcessing ? 'Aprobando...' : 'Aprobar Préstamo'}
                    </Button>
                )}
                {role === 'librarian' && isLoanForLibrarian && !showCheckoutForm && (
                    <Button type="button" onClick={handleReturn}>
                        <BookCheck className="mr-2 h-4 w-4" />
                        Marcar como Devuelto
                    </Button>
                )}
                {role === 'librarian' && !isPendingRequestForLibrarian && !isLoanForLibrarian && !showCheckoutForm &&(
                    <Button type="button" disabled={book.stock === 0} onClick={() => setShowCheckoutForm(true)}>
                        Realizar Préstamo Directo
                    </Button>
                )}
                {role === 'client' && !isRequestByThisUser && !showCheckoutForm && (
                    <Button type="button" disabled={book.stock === 0} onClick={() => setShowCheckoutForm(true)}>
                        Solicitar Préstamo
                    </Button>
                )}
                {!showCheckoutForm && (
                  <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                      Cerrar
                  </Button>
                )}
            </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

    