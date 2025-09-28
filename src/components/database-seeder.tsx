'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, Database, Users, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { initializeDatabase } from '@/lib/supabase-functions';
import { useToast } from '@/hooks/use-toast';

interface DatabaseSeederProps {
  onSeedComplete?: () => void;
}

export function DatabaseSeeder({ onSeedComplete }: DatabaseSeederProps = {}) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSeedDatabase = async (useExpandedData: boolean = false) => {
    setLoading(true);
    try {
      const result = await initializeDatabase(useExpandedData);
      toast({
        title: '✅ Base de datos inicializada',
        description: `Los datos${useExpandedData ? ' expandidos' : ''} se han cargado correctamente en Supabase.`,
      });
      
      // Call the callback to refresh data in parent component
      if (onSeedComplete) {
        setTimeout(() => {
          onSeedComplete();
        }, 1000); // Small delay to ensure data is saved
      }
    } catch (error) {
      console.error('Error seeding database:', error);
      toast({
        variant: 'destructive',
        title: '❌ Error',
        description: 'No se pudo inicializar la base de datos. Verifica la configuración de Supabase.',
      });
    } finally {
      setLoading(false);
    }
  };

  const dataStats = {
    minimal: {
      users: '8 usuarios básicos',
      books: '12 libros esenciales',
      description: 'Conjunto mínimo para pruebas básicas'
    },
    expanded: {
      users: '30+ estudiantes UAT',
      books: '100+ libros diversos',
      description: 'Base de datos completa con datos realistas'
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 w-full max-w-4xl mx-auto">
      {/* Datos Básicos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Datos Básicos
              </CardTitle>
              <CardDescription>{dataStats.minimal.description}</CardDescription>
            </div>
            <Badge variant="secondary">Rápido</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            {dataStats.minimal.users}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4" />
            {dataStats.minimal.books}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => handleSeedDatabase(false)}
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Inicializando...' : 'Usar Datos Básicos'}
          </Button>
        </CardFooter>
      </Card>

      {/* Datos Expandidos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Datos Expandidos
              </CardTitle>
              <CardDescription>{dataStats.expanded.description}</CardDescription>
            </div>
            <Badge>Completo</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            {dataStats.expanded.users}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4" />
            {dataStats.expanded.books}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => handleSeedDatabase(true)}
            disabled={loading}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Inicializando...' : 'Usar Datos Expandidos'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}