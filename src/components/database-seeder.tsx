
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { initialUsers, initialCategories, initialBooks, initialCheckouts, initialCheckoutRequests } from '@/lib/data';

// DEV_NOTE: This component is configured to force-reset the database on every load.
// This is useful for development to ensure a consistent data state.
// For production, change FORCE_RESEED to false.
const FORCE_RESEED = true; 

async function clearCollection(collectionName: string) {
    const batch = writeBatch(db);
    const querySnapshot = await getDocs(collection(db, collectionName));
    querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}

export function DatabaseSeeder() {
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [hasSeeded, setHasSeeded] = useState(false);

  useEffect(() => {
    const hasSeededInSession = sessionStorage.getItem('db_seeded_session') === 'true';

    if (isSeeding || hasSeeded || (hasSeededInSession && !FORCE_RESEED)) {
        return;
    }

    const seedDatabase = async () => {
      setIsSeeding(true);
      
      const shouldSeed = FORCE_RESEED || localStorage.getItem('db_seeded') !== 'true';

      if (!shouldSeed) {
        console.log('Database already seeded and force-reseeding is off. Skipping.');
        setIsSeeding(false);
        setHasSeeded(true);
        return;
      }
        
      console.log('Database is being (re)seeded...');
      toast({ title: "Poblando Base de Datos", description: "Por favor espere, esto puede tardar un momento..." });
      
      try {
        // Clear existing data for a clean slate
        await Promise.all([
            clearCollection('users'),
            clearCollection('categories'),
            clearCollection('books'),
            clearCollection('checkouts'),
            clearCollection('checkoutRequests'),
        ]);

        const batch = writeBatch(db);

        // Add users
        initialUsers.forEach(user => {
          const userRef = doc(collection(db, 'users'));
          batch.set(userRef, user);
        });

        // Add categories
        initialCategories.forEach(category => {
          const catRef = doc(collection(db, 'categories'));
          batch.set(catRef, { name: category.name });
        });

        // Add books and get their new IDs
        const bookTitleToIdMap: { [title: string]: string } = {};
        const bookPromises = initialBooks.map(async (bookData) => {
            const bookRef = doc(collection(db, 'books'));
            batch.set(bookRef, bookData);
            bookTitleToIdMap[bookData.title] = bookRef.id;
        });
        
        await Promise.all(bookPromises);
        
        // Add checkouts and requests using the new book IDs
        initialCheckouts.forEach(checkout => {
            const bookId = bookTitleToIdMap[checkout.bookTitle];
            if (bookId) {
                const checkoutRef = doc(collection(db, 'checkouts'));
                const { bookTitle, ...checkoutData } = checkout;
                batch.set(checkoutRef, { ...checkoutData, bookId });
            }
        });

        initialCheckoutRequests.forEach(request => {
            const bookId = bookTitleToIdMap[request.bookTitle];
            if (bookId) {
                const requestRef = doc(collection(db, 'checkoutRequests'));
                const { bookTitle, ...requestData } = request;
                batch.set(requestRef, { ...requestData, bookId });
            }
        });

        await batch.commit();

        toast({ title: "✅ Base de Datos Poblada", description: "Los datos de ejemplo han sido cargados. ¡Ya puedes iniciar sesión!" });
        localStorage.setItem('db_seeded', 'true'); // Mark for persistence across sessions
        sessionStorage.setItem('db_seeded_session', 'true'); // Mark for this session
        setHasSeeded(true);

      } catch (error) {
        console.error("Error seeding database:", error);
        toast({ variant: 'destructive', title: "Error al poblar la base de datos", description: "Revisa las reglas de seguridad de Firestore y la configuración del proyecto." });
      } finally {
        setIsSeeding(false);
      }
    };

    seedDatabase();
  }, [toast, hasSeeded, isSeeding]);

  // This component renders nothing
  return null;
}

    