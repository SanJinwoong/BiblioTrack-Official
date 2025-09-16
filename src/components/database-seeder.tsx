'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { initialUsers, initialCategories, initialBooks, initialCheckouts, initialCheckoutRequests } from '@/lib/data';

// This component is invisible to the user. Its only purpose is to seed the database.
export function DatabaseSeeder() {
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [hasSeeded, setHasSeeded] = useState(false);

  useEffect(() => {
    // Prevent seeding more than once
    if (hasSeeded || isSeeding || localStorage.getItem('db_seeded') === 'true') {
        return;
    }

    const seedDatabase = async () => {
      setIsSeeding(true);
      const booksCollection = collection(db, 'books');
      const booksSnapshot = await getDocs(booksCollection);

      if (booksSnapshot.empty) {
        console.log('Database is empty. Seeding...');
        toast({ title: "Poblando Base de Datos", description: "Por favor espere, esto puede tardar un momento..." });
        
        try {
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

          // Add books
          const bookTitleToIdMap: { [title: string]: string } = {};
          initialBooks.forEach(bookData => {
            const bookRef = doc(collection(db, 'books'));
            batch.set(bookRef, bookData);
            bookTitleToIdMap[bookData.title] = bookRef.id;
          });

          // Commit initial batch
          await batch.commit();

          // A second batch for checkouts and requests that depend on book IDs
          const checkoutBatch = writeBatch(db);

          initialCheckouts.forEach(checkout => {
            const bookId = bookTitleToIdMap[checkout.bookTitle];
            if (bookId) {
              const checkoutRef = doc(collection(db, 'checkouts'));
              const { bookTitle, ...checkoutData } = checkout;
              checkoutBatch.set(checkoutRef, { ...checkoutData, bookId });
            }
          });

          initialCheckoutRequests.forEach(request => {
            const bookId = bookTitleToIdMap[request.bookTitle];
            if (bookId) {
              const requestRef = doc(collection(db, 'checkoutRequests'));
              const { bookTitle, ...requestData } = request;
              checkoutBatch.set(requestRef, { ...requestData, bookId });
            }
          });
          
          await checkoutBatch.commit();

          toast({ title: "✅ Base de Datos Poblada", description: "Los datos de ejemplo han sido cargados. ¡Ya puedes iniciar sesión!" });
          localStorage.setItem('db_seeded', 'true'); // Mark as seeded
          setHasSeeded(true);

        } catch (error) {
          console.error("Error seeding database:", error);
          toast({ variant: 'destructive', title: "Error al poblar la base de datos", description: "Revisa las reglas de seguridad de Firestore y la configuración del proyecto." });
        } finally {
          setIsSeeding(false);
        }
      } else {
        console.log('Database already contains data. Skipping seed.');
        localStorage.setItem('db_seeded', 'true'); // Mark as seeded if not already
        setHasSeeded(true);
      }
    };

    seedDatabase();
  }, [toast, hasSeeded, isSeeding]);

  // This component renders nothing
  return null;
}
