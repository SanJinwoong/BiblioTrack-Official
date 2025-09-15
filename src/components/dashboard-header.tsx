
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, User, Settings, PlusCircle, Bell } from 'lucide-react';

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

export function DashboardHeader() {
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
        <div className="mr-4 flex">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Library className="h-8 w-8 text-primary" />
            <span className="font-bold text-lg text-foreground">BiblioTrack</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Bell className="h-6 w-6" />
                <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500" />
            </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <User className="h-6 w-6" />
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
                <DropdownMenuItem>
                    <PlusCircle className="mr-2 h-5 w-5" />
                    <span>Add new book</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-5 w-5" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-5 w-5" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
