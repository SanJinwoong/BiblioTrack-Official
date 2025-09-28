"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from './ui/dialog';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { User, BookOpen, Users, Heart } from 'lucide-react';
import { User as UserType } from '@/lib/types';
import { getFollowers, getFollowing, getUserByUsername } from '@/lib/supabase-functions';
import { toast } from '@/hooks/use-toast';

function UserListItemSkeleton() {
  return (
    <div className="flex items-center space-x-3 p-3 animate-pulse">
      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      <div className="flex-1">
        <div className="w-24 h-4 bg-gray-200 rounded mb-1"></div>
        <div className="w-16 h-3 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

interface FollowersModalProps {
  user: UserType;
  currentUser: UserType | null;
  children: React.ReactNode;
}

interface UserListItemProps {
  user: UserType;
  currentUser: UserType | null;
  onUserClick: (username: string) => void;
}

function UserListItem({ user, currentUser, onUserClick }: UserListItemProps) {
  const isCurrentUser = currentUser?.id === user.id;

  return (
    <div 
      className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
      onClick={() => onUserClick(user.username)}
    >
      <Avatar className="w-10 h-10">
        <AvatarFallback className="bg-blue-100 text-blue-600">
          {user.name ? user.name.charAt(0) : user.username.charAt(0)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="font-medium text-sm truncate">
            {user.name || user.username}
          </p>
          {isCurrentUser && (
            <Badge variant="outline" className="text-xs">
              Tú
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">@{user.username}</p>
      </div>

      <div className="flex items-center space-x-3 text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <BookOpen className="w-3 h-3" />
          <span>{user.books_read || 0}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Users className="w-3 h-3" />
          <span>{user.followers?.length || 0}</span>
        </div>
      </div>
    </div>
  );
}

export function FollowersModal({ user, currentUser, children }: FollowersModalProps) {
  const [followers, setFollowers] = useState<UserType[]>([]);
  const [following, setFollowing] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      fetchFollowData();
    }
  }, [open, user.id]);

  const fetchFollowData = async () => {
    try {
      setLoading(true);
      const [followersData, followingData] = await Promise.all([
        getFollowers(user.id),
        getFollowing(user.id)
      ]);
      
      setFollowers(followersData);
      setFollowing(followingData);
    } catch (error) {
      console.error('Error fetching follow data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los datos de seguidores.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (username: string) => {
    setOpen(false);
    router.push(`/profile/${username}`);
  };

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>
              {isOwnProfile ? 'Tus conexiones' : `Conexiones de @${user.username}`}
            </span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="followers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers" className="flex items-center space-x-1">
              <Heart className="w-4 h-4" />
              <span>Seguidores ({followers.length})</span>
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>Siguiendo ({following.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers" className="mt-4">
            <ScrollArea className="h-80">
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <UserListItemSkeleton key={i} />
                  ))}
                </div>
              ) : followers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Heart className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {isOwnProfile 
                      ? 'Aún no tienes seguidores' 
                      : `@${user.username} no tiene seguidores aún`
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {followers.map((follower) => (
                    <UserListItem
                      key={follower.id}
                      user={follower}
                      currentUser={currentUser}
                      onUserClick={handleUserClick}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="following" className="mt-4">
            <ScrollArea className="h-80">
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <UserListItemSkeleton key={i} />
                  ))}
                </div>
              ) : following.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {isOwnProfile 
                      ? 'Aún no sigues a nadie' 
                      : `@${user.username} no sigue a nadie aún`
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {following.map((followedUser) => (
                    <UserListItem
                      key={followedUser.id}
                      user={followedUser}
                      currentUser={currentUser}
                      onUserClick={handleUserClick}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}