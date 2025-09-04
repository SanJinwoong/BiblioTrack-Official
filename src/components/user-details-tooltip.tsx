
'use client';

import { users } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { User } from 'lucide-react';

interface UserDetailsTooltipProps {
  userId: string;
}

export function UserDetailsTooltip({ userId }: UserDetailsTooltipProps) {
    const user = users.find(u => u.username === `${userId}@alumnos.uat.edu.mx` || u.username === userId || u.name === userId);

    if (!user) {
        return <div className="p-4 text-sm">Usuario no encontrado.</div>;
    }

    return (
        <div className="p-2 max-w-sm">
            <CardHeader className="p-2">
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
    );
}
