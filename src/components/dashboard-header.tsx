
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, User, Settings, PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Library } from './icons/uat-logo';

interface DashboardHeaderProps {
  onAddNewBook: () => void;
  onSettingsClick: () => void;
}

export function DashboardHeader({ onAddNewBook, onSettingsClick }: DashboardHeaderProps) {
  const router = useRouter();
  const [username, setUsername] = useState('');

  useEffect(() => {
    setUsername(localStorage.getItem('userUsername') || 'user');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userUsername');
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Library className="h-8 w-8 text-primary" />
            <span className="font-bold text-lg text-foreground">BiblioTrack</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
           <Button onClick={onAddNewBook} className="rounded-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Book
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">My Account</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {username}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={onSettingsClick}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
