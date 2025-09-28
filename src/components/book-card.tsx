
import Image from 'next/image';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import type { Book } from '@/lib/types';
import { cn, getBookCoverUrl } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Badge } from './ui/badge';

interface BookCardProps {
  book: Book;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isApproved?: boolean;
  isPending?: boolean;
  isOverdue?: boolean;
  isLoan?: boolean;
  emphasizeAuthor?: boolean; // mejora contraste de autor en contextos con badges
}

export function BookCard({ book, children, className, onClick, isApproved = false, isPending = false, isOverdue = false, isLoan = false, emphasizeAuthor = false }: BookCardProps) {

  const getStockBadge = () => {
    if (book.stock === 0) {
      return (
        <Badge className={cn("text-xs font-semibold", 'bg-gray-100 text-gray-600')}>
          Agotado
        </Badge>
      );
    }
    if (book.stock <= 3) {
      return (
        <Badge className={cn("text-xs font-semibold", 'bg-yellow-100 text-yellow-800')}>
          Disponible
        </Badge>
      );
    }
    return (
      <Badge className={cn("text-xs font-semibold", 'bg-green-100 text-green-800')}>
        Disponible
      </Badge>
    );
  };
  
  const getLoanStatusBadge = () => {
    if (isOverdue) {
        return (
            <Badge className='bg-yellow-100 text-yellow-800'>
                Vencido
            </Badge>
        );
    }
    return (
        <Badge className={cn("text-xs font-semibold", 'bg-green-100 text-green-800')}>
            Prestado
        </Badge>
    );
  };

  return (
    <Card 
        className={cn("group relative flex flex-col overflow-hidden transition-shadow hover:shadow-xl h-full cursor-pointer border-0 shadow-md", className)}
        onClick={onClick}
    >
        <div className="relative aspect-[3/4.5] w-full overflow-hidden rounded-lg">
          <Image
            src={getBookCoverUrl(book)}
            alt={`Portada de ${book.title}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 15vw"
            data-ai-hint={`${book.category} book cover`}
          />
           {isApproved && (
             <div className="absolute top-2 right-2 flex items-center justify-center h-6 w-6 rounded-full bg-green-500/90 backdrop-blur-sm">
                <Check className="h-4 w-4 text-white" strokeWidth={3} />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
           <CardContent className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
                <p className={cn(
                  "text-xs line-clamp-1",
                  emphasizeAuthor ? "text-white/95 font-medium drop-shadow" : "text-white/80"
                )}>{book.author}</p>
           </CardContent>
        </div>
      {children}
    </Card>
  );
}
