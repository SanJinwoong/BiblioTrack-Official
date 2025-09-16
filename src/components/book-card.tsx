
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Book } from '@/lib/types';
import { cn } from '@/lib/utils';
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
}

export function BookCard({ book, children, className, onClick, isApproved = false, isPending = false, isOverdue = false, isLoan = false }: BookCardProps) {

  const getStockBadge = () => {
    if (book.stock === 0) {
      return (
        <Badge className={cn("text-xs font-semibold", 'bg-gray-100 text-gray-600')}>
          Agotado
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
            <Badge variant="destructive">
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
        className={cn("group flex flex-col overflow-hidden transition-shadow hover:shadow-xl h-full cursor-pointer border-0 shadow-md", className)}
        onClick={onClick}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-[3/4.5] w-full overflow-hidden rounded-t-lg">
          <Image
            src={book.coverUrl}
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
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow p-3">
        <div className="flex-grow">
            <CardTitle className="font-semibold text-sm mb-1 line-clamp-2">
              {book.title}
            </CardTitle>
            <CardDescription className="text-xs line-clamp-1">{book.author}</CardDescription>
        </div>
        <div className="mt-3 flex justify-between items-center">
            {isLoan ? getLoanStatusBadge() : (!isApproved && !isPending && getStockBadge())}
            {isPending && <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 animate-pulse">Pendiente</Badge>}
        </div>
      </CardContent>
      {children}
    </Card>
  );
}
