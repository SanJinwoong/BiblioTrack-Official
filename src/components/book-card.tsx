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

interface BookCardProps {
  book: Book;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function BookCard({ book, children, className, onClick }: BookCardProps) {
  const isAvailable = book.stock > 0;

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
            <CardTitle className="font-headline text-sm mb-1 line-clamp-2">{book.title}</CardTitle>
            <CardDescription className="text-xs line-clamp-1">{book.author}</CardDescription>
        </div>
        <div className="mt-2">
            <Badge 
                variant={isAvailable ? 'default' : 'secondary'} 
                className={`text-xs ${isAvailable ? 'bg-accent text-accent-foreground' : ''}`}
            >
                {isAvailable ? 'Disponible' : 'Agotado'}
            </Badge>
        </div>
      </CardContent>
      {children}
    </Card>
  );
}
