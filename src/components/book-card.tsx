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

interface BookCardProps {
  book: Book;
  children?: React.ReactNode;
}

export function BookCard({ book, children }: BookCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="relative aspect-[3/4.5] w-full">
          <Image
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            data-ai-hint={`${book.genre} book cover`}
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow p-4">
        <div className="flex-grow">
            <CardTitle className="font-headline text-lg mb-1 line-clamp-2">{book.title}</CardTitle>
            <CardDescription>{book.author}</CardDescription>
        </div>
        <div className="mt-4">
            <Badge variant={book.available ? 'default' : 'secondary'} className={book.available ? 'bg-accent text-accent-foreground' : ''}>
                {book.available ? 'Available' : 'Checked Out'}
            </Badge>
        </div>
      </CardContent>
      {children}
    </Card>
  );
}
