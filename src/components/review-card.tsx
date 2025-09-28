
'use client';

import type { Book, User, Review } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarRating } from './star-rating';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { getBookCoverUrl } from '@/lib/utils';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const { user, book, rating, comment, date } = review;

  return (
    <Card>
      <CardHeader className="p-4 flex-row gap-3 items-center">
        {user && (
           <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
        <div className="flex-1">
          <p className="font-semibold text-sm">{user?.name || 'Usuario Anónimo'}</p>
          <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })}</p>
        </div>
        <StarRating rating={rating} readOnly />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground italic">&quot;{comment}&quot;</p>
      </CardContent>
    {book && (
     <CardFooter className="px-4 py-3 mt-2 border-t bg-muted/50">
      <div className="flex items-center gap-3">
        <Image src={getBookCoverUrl(book)} alt={book.title} width={36} height={54} className="rounded-sm object-cover shadow-sm" />
        <div className="space-y-0.5">
          <p className="text-xs font-semibold leading-tight">Sobre &quot;{book.title}&quot;</p>
          <p className="text-xs text-muted-foreground">{book.author}</p>
        </div>
      </div>
     </CardFooter>
    )}
    </Card>
  );
}
