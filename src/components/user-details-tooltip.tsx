
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User as UserType } from '@/lib/types';
import { CardContent, CardHeader, CardTitle } from './ui/card';
import { User } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface UserDetailsTooltipProps {
  userId: string;
  children: React.ReactNode;
}

export function UserDetailsTooltip({ userId, children }: UserDetailsTooltipProps) {
    const [users, setUsers] = useState<UserType[]>([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'users'), snapshot => {
            setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserType)));
        });
        return () => unsubscribe();
    }, []);

    const user = users.find(u => {
        const usernameMatch = u.username.split('@')[0];
        return usernameMatch === userId || u.name === userId || u.username === userId || u.id === userId;
    });

    const content = user ? (
        <div className="p-2 max-w-sm">
            <CardHeader className="p-2 border-b mb-2">
                <CardTitle className="text-base flex items-center">
                    <User className="mr-2 h-4 w-4" /> Detalle del Usuario
                </CardTitle>
            </CardHeader>
            <CardContent className="p-2 text-sm space-y-2">
                <p><strong>Nombre:</strong> {user.name || 'N/A'}</p>
                <p><strong>Matrícula/Usuario:</strong> {user.username}</p>
                <p><strong>CURP:</strong> {user.curp || 'N/A'}</p>
                <p><strong>Teléfono:</strong> {user.phone || 'N/A'}</p>
                <p><strong>Email:</strong> {user.email || 'N/A'}</p>
                <p><strong>Dirección:</strong> {user.address || 'N/A'}</p>
            </CardContent>
        </div>
    ) : (
        <div className="p-4 text-sm">Cargando datos del usuario...</div>
    );

    return (
        <Popover>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent className="w-80">
                {content}
            </PopoverContent>
        </Popover>
    );
}
