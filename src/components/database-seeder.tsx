'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Database } from 'lucide-react';
import { initializeDatabase } from '@/lib/supabase-functions';
import { useToast } from '@/hooks/use-toast';

export function DatabaseSeeder() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSeedDatabase = async () => {
    setLoading(true);
    try {
      await initializeDatabase();
      toast({
        title: '✅ Base de datos inicializada',
        description: 'Los datos de muestra se han cargado correctamente en Supabase.',
      });
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Inicializar Base de Datos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Carga los datos de muestra en tu base de datos de Supabase.
          Esto incluye usuarios, libros, categorías y registros de ejemplo.
        </p>
        <Button 
          onClick={handleSeedDatabase}
          disabled={loading}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Inicializando...' : 'Cargar Datos de Muestra'}
        </Button>
      </CardContent>
    </Card>
  );
}