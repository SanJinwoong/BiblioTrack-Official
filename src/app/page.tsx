import { Library } from 'lucide-react';
import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-3 text-primary">
          <Library className="h-12 w-12" />
          <h1 className="text-5xl font-bold font-headline">BiblioTrack</h1>
        </div>
        <p className="text-muted-foreground">
          Your personal library assistant.
        </p>
        <div className="w-full max-w-sm pt-4">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
