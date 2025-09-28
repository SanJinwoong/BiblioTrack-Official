export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          password: string
          role: 'client' | 'librarian'
          name: string                    // OBLIGATORIO en esquema UAT
          curp: string                    // OBLIGATORIO en esquema UAT
          phone: string                   // OBLIGATORIO en esquema UAT
          email: string                   // OBLIGATORIO en esquema UAT
          address: string                 // OBLIGATORIO en esquema UAT
          status: 'active' | 'deactivated'
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          favorite_books: string[] | null
          following: string[] | null
          followers: string[] | null
          created_at: string | null
        }
        Insert: {
          id?: string
          username: string
          password: string
          role: 'client' | 'librarian'
          name: string                    // OBLIGATORIO en esquema UAT
          curp: string                    // OBLIGATORIO en esquema UAT
          phone: string                   // OBLIGATORIO en esquema UAT
          email: string                   // OBLIGATORIO en esquema UAT
          address: string                 // OBLIGATORIO en esquema UAT
          status?: 'active' | 'deactivated'
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          favorite_books?: string[] | null
          following?: string[] | null
          followers?: string[] | null
          created_at?: string | null
        }
        Update: {
          id?: string
          username?: string
          password?: string
          role?: 'client' | 'librarian'
          name?: string                   // Opcional para updates
          curp?: string                   // Opcional para updates
          phone?: string                  // Opcional para updates
          email?: string                  // Opcional para updates
          address?: string                // Opcional para updates
          status?: 'active' | 'deactivated'
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          favorite_books?: string[] | null
          following?: string[] | null
          followers?: string[] | null
          created_at?: string | null
        }
      }
      books: {
        Row: {
          id: string
          title: string
          author: string
          description: string
          cover_url: string
          category: string
          stock: number
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          author: string
          description: string
          cover_url: string
          category: string
          stock: number
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          author?: string
          description?: string
          cover_url?: string
          category?: string
          stock?: number
          created_at?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_at?: string | null
        }
      }
      checkouts: {
        Row: {
          id: string
          user_id: string
          book_id: string
          due_date: string
          status: 'pending' | 'approved' | 'returned'
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          due_date: string
          status: 'pending' | 'approved' | 'returned'
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          due_date?: string
          status?: 'pending' | 'approved' | 'returned'
          created_at?: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          book_id: string
          rating: number
          comment: string
          date: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          rating: number
          comment: string
          date: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          rating?: number
          comment?: string
          date?: string
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}