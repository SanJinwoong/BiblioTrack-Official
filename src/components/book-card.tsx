
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Book } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface BookCardProps {
  book: Book;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isApproved?: boolean;
  isPending?: boolean;
}

export function BookCard({ book, children, className, onClick, isApproved = false, isPending = false }: BookCardProps) {

  const getStockBadge = () => {
    if (book.stock > 2) {
      return (
        <Badge className="text-xs bg-green-100 text-green-800">
          Disponible ({book.stock})
        </Badge>
      );
    }
    if (book.stock > 0) {
      return (
        <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
          Poco stock ({book.stock})
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-xs">
        Agotado
      </Badge>
    );
  };

  return (
    <Card 
        className={cn("flex flex-col overflow-hidden transition-shadow hover:shadow-lg h-full cursor-pointer", className)}
        onClick={onClick}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-[3/4.5] w-full">
          <Image
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 15vw"
            data-ai-hint={`${book.genre} book cover`}
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow p-3">
        <div className="flex-grow">
            <CardTitle className="font-headline text-sm mb-1 line-clamp-2 flex items-start">
              <span className="truncate pt-px">{book.title}</span>
              {isApproved && (
                 <div className="ml-1.5 shrink-0 relative flex items-center justify-center h-4 w-4">
                    <svg className="absolute h-full w-full text-green-500" fill="currentColor" viewBox="0 0 18 18">
                        <path d="M9 18A9 9 0 109 0a9 9 0 000 18z"/>
                    </svg>
                    <Check className="relative h-3 w-3 text-green-50" strokeWidth={4} />
                </div>
              )}
            </CardTitle>
            <CardDescription className="text-xs line-clamp-1">{book.author}</CardDescription>
        </div>
        {!isApproved && !isPending && (
          <div className="mt-2">
              {getStockBadge()}
          </div>
        )}
      </CardContent>
      {children}
    </Card>
  );
}
