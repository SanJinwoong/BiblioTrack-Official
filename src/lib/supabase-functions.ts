import { supabase } from './supabase'
import type { Book, Checkout, User, Category, Review, UserActivity, UserFavorite, UserFollow, LibraryPolicies, LoanDurationOption } from './types'

// User functions
export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
  
  if (error) {
    console.error('Error fetching users:', error)
    throw error
  }
  
  if (!data) return [];
  return data.map((u: any) => ({
    id: u.id,
    username: u.username,
    password: u.password,
    role: u.role,
    name: u.name,
    curp: u.curp,
    phone: u.phone,
    email: u.email,
    address: u.address,
    status: u.status,
    avatarUrl: u.avatar_url,
    bannerUrl: u.banner_url,
    bio: u.bio,
    badgeCategoryId: u.badge_category_id || undefined,
    badgeLabel: u.badge_label || undefined,
    createdAt: u.created_at,
    favoriteBooks: u.favorite_books || undefined,
  }))
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user:', error)
    throw error
  }
  if (!data) return null;

  // Map database fields to User interface shape
  return {
    id: data.id,
    username: data.username,
    password: data.password,
    role: data.role,
    name: data.name,
    curp: data.curp,
    phone: data.phone,
    email: data.email,
    address: data.address,
    status: data.status,
    avatarUrl: data.avatar_url,
    bannerUrl: data.banner_url,
    bio: data.bio,
    badgeCategoryId: data.badge_category_id || undefined,
    badgeLabel: data.badge_label || undefined,
    createdAt: data.created_at,
    favoriteBooks: data.favorite_books || undefined,
  }
}

export async function createUser(userData: Partial<User>): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating user:', error)
    throw error
  }
  
  return data
}

export async function addUser(userData: Partial<User>): Promise<User> {
  return createUser(userData)
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  console.log('🔄 updateUser llamada con:', { id, updates });
  
  // Map interface fields to database fields
  const mappedUpdates: any = { ...updates }
  
  if (updates.avatarUrl !== undefined) {
    mappedUpdates.avatar_url = updates.avatarUrl
    delete mappedUpdates.avatarUrl
    console.log('🖼️ Avatar URL mapeada:', mappedUpdates.avatar_url);
  }
  
  if (updates.bannerUrl !== undefined) {
    mappedUpdates.banner_url = updates.bannerUrl
    delete mappedUpdates.bannerUrl
    console.log('🖼️ Banner URL mapeada:', mappedUpdates.banner_url);
  }
  // Insignia
  if (updates.badgeCategoryId !== undefined) {
    mappedUpdates.badge_category_id = updates.badgeCategoryId
    delete mappedUpdates.badgeCategoryId
  }
  if (updates.badgeLabel !== undefined) {
    mappedUpdates.badge_label = updates.badgeLabel
    delete mappedUpdates.badgeLabel
  }

  console.log('📤 Datos a enviar a Supabase:', mappedUpdates);

  const { data, error } = await supabase
    .from('users')
    .update(mappedUpdates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('❌ Error updating user:', error)
    throw error
  }
  
  console.log('✅ Usuario actualizado exitosamente:', data);
  
  // Map database fields back to interface fields
  return {
    id: data.id,
    username: data.username,
    password: data.password,
    role: data.role,
    name: data.name,
    curp: data.curp,
    phone: data.phone,
    email: data.email,
    address: data.address,
    status: data.status,
    avatarUrl: data.avatar_url,
    bannerUrl: data.banner_url,
    bio: data.bio,
    badgeCategoryId: data.badge_category_id || undefined,
    badgeLabel: data.badge_label || undefined,
    createdAt: data.created_at,
    favoriteBooks: data.favorite_books || undefined,
  }
}

// Book functions
export async function getBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
  
  if (error) {
    console.error('Error fetching books:', error)
    throw error
  }
  
  // Map database fields back to interface fields
  return data?.map(book => ({
    id: book.id,
    title: book.title,
    author: book.author,
    description: book.description,
    coverUrl: book.cover_url, // Map cover_url to coverUrl
    category: book.category,
    stock: book.stock
  })) || []
}

export async function createBook(bookData: Omit<Book, 'id'>): Promise<Book> {
  // Map interface fields to database column names
  const mappedBookData = {
    title: bookData.title,
    author: bookData.author,
    description: bookData.description,
    cover_url: bookData.coverUrl, // Map coverUrl to cover_url
    category: bookData.category,
    stock: bookData.stock
  }
  
  const { data, error } = await supabase
    .from('books')
    .insert([mappedBookData])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating book:', error)
    throw error
  }
  
  // Map back to interface fields
  return {
    id: data.id,
    title: data.title,
    author: data.author,
    description: data.description,
    coverUrl: data.cover_url, // Map cover_url back to coverUrl
    category: data.category,
    stock: data.stock
  }
}

export async function addBook(bookData: Omit<Book, 'id'>): Promise<Book> {
  return createBook(bookData)
}

export async function updateBook(id: string, updates: Partial<Book>): Promise<Book> {
  // Map interface fields to database column names
  const mappedUpdates: any = {};
  if (updates.title !== undefined) mappedUpdates.title = updates.title;
  if (updates.author !== undefined) mappedUpdates.author = updates.author;
  if (updates.description !== undefined) mappedUpdates.description = updates.description;
  if (updates.coverUrl !== undefined) mappedUpdates.cover_url = updates.coverUrl; // Map coverUrl to cover_url
  if (updates.category !== undefined) mappedUpdates.category = updates.category;
  if (updates.stock !== undefined) mappedUpdates.stock = updates.stock;
  
  const { data, error } = await supabase
    .from('books')
    .update(mappedUpdates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating book:', error)
    throw error
  }
  
  // Map back to interface fields
  return {
    id: data.id,
    title: data.title,
    author: data.author,
    description: data.description,
    coverUrl: data.cover_url, // Map cover_url back to coverUrl
    category: data.category,
    stock: data.stock
  }
}

export async function deleteBook(id: string): Promise<void> {
  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting book:', error)
    throw error
  }
}

// Favorites functions
export async function addToFavorites(userId: string, bookId: string): Promise<boolean> {
  try {
    // Get user's current favorites
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('favorite_books')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching user favorites:', fetchError)
      return false
    }

    const currentFavorites = userData.favorite_books || []
    
    // Add book to favorites if not already there
    if (!currentFavorites.includes(bookId)) {
      const updatedFavorites = [...currentFavorites, bookId]
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ favorite_books: updatedFavorites })
        .eq('id', userId)

      if (updateError) {
        console.error('Error adding to favorites:', updateError)
        return false
      }

      // Sincronizar también con tabla user_favorites para la vista de perfil
      const { error: favInsertError } = await supabase
        .from('user_favorites')
        .upsert({ user_id: userId, book_id: bookId })
      if (favInsertError) {
        // No hacemos return false porque la parte principal ya se guardó
        console.warn('Warning: fallo al sincronizar user_favorites:', favInsertError)
      }
    }

    return true
  } catch (error) {
    console.error('Unexpected error in addToFavorites:', error)
    return false
  }
}

export async function removeFromFavorites(userId: string, bookId: string): Promise<boolean> {
  try {
    // Get user's current favorites
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('favorite_books')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching user favorites:', fetchError)
      return false
    }

    const currentFavorites = userData.favorite_books || []
    
    // Remove book from favorites
    const updatedFavorites = currentFavorites.filter((fav: string) => fav !== bookId)
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ favorite_books: updatedFavorites })
      .eq('id', userId)

    if (updateError) {
      console.error('Error removing from favorites:', updateError)
      return false
    }

    // Quitar también de la tabla user_favorites si existe
    const { error: favDeleteError } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('book_id', bookId)
    if (favDeleteError) {
      console.warn('Warning: fallo al sincronizar borrado en user_favorites:', favDeleteError)
    }

    return true
  } catch (error) {
    console.error('Unexpected error in removeFromFavorites:', error)
    return false
  }
}

// Checkout functions
export async function getCheckouts(): Promise<Checkout[]> {
  try {
    console.log('Fetching checkouts from database...')
    const { data, error } = await supabase
      .from('checkouts')
      .select('*')
    
    if (error) {
      console.error('Error fetching checkouts:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return []
    }
    
    console.log('Checkouts fetched successfully:', data?.length || 0, 'records')
    
    // Map database fields back to interface fields
    return data?.map(checkout => ({
      id: checkout.id,
      userId: checkout.user_id,
      bookId: checkout.book_id,
      dueDate: checkout.due_date,
      status: checkout.status
    })) || []
  } catch (error) {
    console.error('Unexpected error in getCheckouts:', error)
    return []
  }
}

export async function createCheckout(checkoutData: Omit<Checkout, 'id'>): Promise<Checkout> {
  // Map interface fields to database column names
  const mappedCheckoutData = {
    user_id: checkoutData.userId,
    book_id: checkoutData.bookId,
    due_date: checkoutData.dueDate,
    status: checkoutData.status
  }
  
  const { data, error } = await supabase
    .from('checkouts')
    .insert([mappedCheckoutData])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating checkout:', error)
    throw error
  }
  
  // Map back to interface fields
  return {
    id: data.id,
    userId: data.user_id,
    bookId: data.book_id,
    dueDate: data.due_date,
    status: data.status
  }
}

export async function addCheckout(checkoutData: Omit<Checkout, 'id'>): Promise<Checkout> {
  return createCheckout(checkoutData)
}

// Category functions
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
  
  if (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
  
  return data || []
}

export async function createCategory(categoryData: Omit<Category, 'id'>): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: categoryData.name,
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating category:', error)
    throw error
  }

  return {
    id: data.id,
    name: data.name,
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)
  
  if (error) {
    console.error('Error deleting category:', error)
    throw error
  }
}

// Policies functions
export async function getLibraryPolicies(): Promise<LibraryPolicies> {
  try {
    const { data, error } = await supabase
      .from('library_policies')
      .select('*')
      .single()
    
    if (error) {
      // If table doesn't exist or no data, return default policies
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.warn('Library policies table not found, using default policies')
        return { 
          maxLoans: 3, 
          gracePeriod: 7,
          loanDurationOptions: [
            { value: "1-weeks", label: "1 semana" },
            { value: "2-weeks", label: "2 semanas" },
            { value: "3-weeks", label: "3 semanas" },
            { value: "1-months", label: "1 mes" }
          ]
        }
      }
      console.error('Error fetching policies:', error)
      return { 
        maxLoans: 3, 
        gracePeriod: 7,
        loanDurationOptions: [
          { value: "1-weeks", label: "1 semana" },
          { value: "2-weeks", label: "2 semanas" },
          { value: "3-weeks", label: "3 semanas" },
          { value: "1-months", label: "1 mes" }
        ]
      }
    }
    
    // Parse loan duration options if they exist
    let parsedOptions: LoanDurationOption[] = [
      { value: "1-weeks", label: "1 semana" },
      { value: "2-weeks", label: "2 semanas" },
      { value: "3-weeks", label: "3 semanas" },
      { value: "1-months", label: "1 mes" }
    ];
    
    if (data.loan_duration_options) {
      try {
        parsedOptions = JSON.parse(data.loan_duration_options);
      } catch (e) {
        console.warn('Failed to parse loan_duration_options, using defaults');
      }
    }
    
    return {
      maxLoans: data.max_loans,
      gracePeriod: data.grace_period,
      loanDurationOptions: parsedOptions,
    }
  } catch (error) {
    console.error('Error in getLibraryPolicies:', error)
    return { 
      maxLoans: 3, 
      gracePeriod: 7,
      loanDurationOptions: [
        { value: "1-weeks", label: "1 semana" },
        { value: "2-weeks", label: "2 semanas" },
        { value: "3-weeks", label: "3 semanas" },
        { value: "1-months", label: "1 mes" }
      ]
    }
  }
}

export async function updateLibraryPolicies(policies: { maxLoans: number; gracePeriod: number; loanDurationOptions?: LoanDurationOption[] }): Promise<void> {
  try {
    const mappedData: any = {
      id: 1, // Single row for policies
      max_loans: policies.maxLoans,
      grace_period: policies.gracePeriod,
      updated_at: new Date().toISOString(),
    };
    
    if (policies.loanDurationOptions) {
      mappedData.loan_duration_options = JSON.stringify(policies.loanDurationOptions);
    }

    const { error } = await supabase
      .from('library_policies')
      .upsert(mappedData, { onConflict: 'id' })

    if (error) {
      console.error('Error updating policies:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in updateLibraryPolicies:', error)
    throw error
  }
}

// Review functions
export async function getReviews(): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
    
    if (error) {
      console.error('Error fetching reviews:', error)
      return []
    }

    // Map database fields back to interface fields
    return data?.map(review => ({
      id: review.id,
      userId: review.user_id,
      bookId: review.book_id,
      rating: review.rating,
      comment: review.comment,
      date: review.date
    })) || []
  } catch (error) {
    console.error('Error in getReviews:', error)
    return []
  }
}

// Social functions
// Additional functions needed by components
export async function getCheckoutsByUserId(userId: string): Promise<Checkout[]> {
  const { data, error } = await supabase
    .from('checkouts')
    .select('*')
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error fetching user checkouts:', error)
    return []
  }
  
  // Map database fields back to interface fields
  return data?.map(checkout => ({
    id: checkout.id,
    userId: checkout.user_id,
    bookId: checkout.book_id,
    dueDate: checkout.due_date,
    status: checkout.status
  })) || []
}

export async function getReviewsByBookId(bookId: string): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        users:user_id (username, name, avatar_url)
      `)
      .eq('book_id', bookId)
    
    if (error) {
      console.error('Error fetching book reviews:', error)
      return [] // Return empty array instead of throwing
    }
    
    // Map database fields back to interface fields
    return data?.map(review => ({
      id: review.id,
      userId: review.user_id,
      bookId: review.book_id,
      rating: review.rating,
      comment: review.comment,
      date: review.date,
      // Include user data with camelCase mapping for avatarUrl
      user: review.users
        ? {
            username: review.users.username,
            name: review.users.name,
            avatarUrl: (review.users as any).avatar_url
          }
        : undefined
    })) || []
  } catch (error) {
    console.error('Error in getReviewsByBookId:', error)
    return [] // Return empty array on any error
  }
}

// User Follows functions
export async function followUser(followerId: string, followingId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
      })
    
    if (error) {
      console.error('Error following user:', error)
      throw error
    }
    
    // Create activity
    await createUserActivity({
      userId: followerId,
      activityType: 'user_follow',
      targetId: followingId,
      description: 'Started following a user',
    })
  } catch (error) {
    console.error('Error in followUser:', error)
    throw error
  }
}

export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
    
    if (error) {
      console.error('Error unfollowing user:', error)
      throw error
    }
    
    // Create activity
    await createUserActivity({
      userId: followerId,
      activityType: 'user_unfollow',
      targetId: followingId,
      description: 'Unfollowed a user',
    })
  } catch (error) {
    console.error('Error in unfollowUser:', error)
    throw error
  }
}

export async function getFollowers(userId: string): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('user_follows')
      .select(`
        *,
        follower:follower_id (*)
      `)
      .eq('following_id', userId)
    
    if (error) {
      console.error('Error fetching followers:', error)
      return []
    }
    
    return data?.map(follow => ({
      id: follow.follower.id,
      username: follow.follower.username,
      role: follow.follower.role,
      name: follow.follower.name,
      curp: follow.follower.curp,
      phone: follow.follower.phone,
      email: follow.follower.email,
      address: follow.follower.address,
      avatarUrl: follow.follower.avatar_url,
      bannerUrl: follow.follower.banner_url,
      bio: follow.follower.bio,
      status: follow.follower.status,
      createdAt: follow.follower.created_at,
    })) || []
  } catch (error) {
    console.error('Error in getFollowers:', error)
    return []
  }
}

export async function getFollowing(userId: string): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('user_follows')
      .select(`
        *,
        following:following_id (*)
      `)
      .eq('follower_id', userId)
    
    if (error) {
      console.error('Error fetching following:', error)
      return []
    }
    
    return data?.map(follow => ({
      id: follow.following.id,
      username: follow.following.username,
      role: follow.following.role,
      name: follow.following.name,
      curp: follow.following.curp,
      phone: follow.following.phone,
      email: follow.following.email,
      address: follow.following.address,
      avatarUrl: follow.following.avatar_url,
      bannerUrl: follow.following.banner_url,
      bio: follow.following.bio,
      status: follow.following.status,
      createdAt: follow.following.created_at,
    })) || []
  } catch (error) {
    console.error('Error in getFollowing:', error)
    return []
  }
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking follow status:', error)
      return false
    }
    
    return !!data
  } catch (error) {
    console.error('Error in isFollowing:', error)
    return false
  }
}

export async function getCheckoutRequests(): Promise<any[]> {
  try {
    console.log('Fetching checkout requests from database...')
    // Simple query without relationships for now
    const { data, error } = await supabase
      .from('checkout_requests')
      .select('*')
    
    if (error) {
      console.error('Error fetching checkout requests:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return []
    }
    
    console.log('Checkout requests fetched successfully:', data?.length || 0, 'records')
    // Mapear a formato consistente con el resto del frontend
    return (data || []).map(r => ({
      id: r.id,
      userId: r.user_id,
      bookId: r.book_id,
      dueDate: r.due_date,
      status: r.status,
      createdAt: r.created_at
    }))
  } catch (error) {
    console.error('Unexpected error in getCheckoutRequests:', error)
    return []
  }
}

export async function updateCheckout(id: string, updates: any): Promise<any> {
  try {
    console.log('Updating checkout:', id, updates)
    const { data, error } = await supabase
      .from('checkouts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating checkout:', error)
      return null
    }
    
    console.log('Checkout updated successfully:', data)
    return data
  } catch (error) {
    console.error('Unexpected error in updateCheckout:', error)
    return null
  }
}

export async function deleteCheckout(id: string): Promise<void> {
  try {
    console.log('Deleting checkout:', id)
    const { error } = await supabase
      .from('checkouts')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting checkout:', error)
      throw error
    }
    
    console.log('Checkout deleted successfully')
  } catch (error) {
    console.error('Unexpected error in deleteCheckout:', error)
    throw error
  }
}

export async function deleteCheckoutRequest(id: string): Promise<void> {
  try {
    console.log('Deleting checkout request:', id)
    const { error } = await supabase
      .from('checkout_requests')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting checkout request:', error)
      throw error
    }
    
    console.log('Checkout request deleted successfully')
  } catch (error) {
    console.error('Unexpected error in deleteCheckoutRequest:', error)
    throw error
  }
}

export async function addCheckoutRequest(requestData: any): Promise<any> {
  try {
    console.log('Adding checkout request:', requestData)
    
    // Map interface fields to database column names if needed
    // Esquema requiere: user_id, book_id, due_date (DATE), status
    // Aseguramos due_date en formato YYYY-MM-DD
    const dueDateSource = requestData.dueDate || requestData.due_date || requestData.requestedDate || requestData.requested_date
    const dueDate = dueDateSource 
      ? new Date(dueDateSource).toISOString().slice(0,10)
      : new Date(Date.now() + 7*24*3600*1000).toISOString().slice(0,10) // default 7 días

    const mappedRequestData = {
      user_id: requestData.userId || requestData.user_id,
      book_id: requestData.bookId || requestData.book_id,
      due_date: dueDate,
      status: requestData.status || 'pending'
    }
    console.log('Mapped checkout request data ->', mappedRequestData)

    // Validación básica de UUID (v4) para user_id y book_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!mappedRequestData.user_id || !uuidRegex.test(mappedRequestData.user_id)) {
      console.error('❌ Invalid or missing user_id (must be UUID):', mappedRequestData.user_id)
      throw new Error('Invalid user_id (UUID required)')
    }
    if (!mappedRequestData.book_id || !uuidRegex.test(mappedRequestData.book_id)) {
      console.error('❌ Invalid or missing book_id (must be UUID):', mappedRequestData.book_id)
      throw new Error('Invalid book_id (UUID required)')
    }

    // Prevención de solicitudes duplicadas
    // 1. ¿Existe ya una solicitud pendiente para este libro y usuario?
    const { data: existingRequest, error: existingReqError } = await supabase
      .from('checkout_requests')
      .select('id,status')
      .eq('user_id', mappedRequestData.user_id)
      .eq('book_id', mappedRequestData.book_id)
      .eq('status', 'pending')
      .maybeSingle()

    if (existingReqError && existingReqError.code !== 'PGRST116') {
      console.warn('Warning checking existing pending request:', existingReqError)
    }
    if (existingRequest) {
      console.warn('Duplicate pending request detected for user/book:', mappedRequestData)
      const dupError = new Error('DUPLICATE_REQUEST_PENDING')
      ;(dupError as any).friendlyMessage = 'Ya tienes una solicitud pendiente para este libro.'
      throw dupError
    }

    // 2. ¿Existe ya un préstamo activo (approved) para este libro y usuario?
    const { data: existingCheckout, error: existingCheckoutError } = await supabase
      .from('checkouts')
      .select('id,status')
      .eq('user_id', mappedRequestData.user_id)
      .eq('book_id', mappedRequestData.book_id)
      .eq('status', 'approved')
      .maybeSingle()

    if (existingCheckoutError && existingCheckoutError.code !== 'PGRST116') {
      console.warn('Warning checking existing active checkout:', existingCheckoutError)
    }
    if (existingCheckout) {
      console.warn('Duplicate active checkout detected for user/book:', mappedRequestData)
      const dupError = new Error('DUPLICATE_CHECKOUT_ACTIVE')
      ;(dupError as any).friendlyMessage = 'Ya tienes este libro prestado actualmente.'
      throw dupError
    }
    
    const { data, error } = await supabase
      .from('checkout_requests')
      .insert([mappedRequestData])
      .select()
      .single()
    
    if (error) {
      console.error('Error adding checkout request:', {
        message: (error as any).message,
        code: (error as any).code,
        details: (error as any).details,
        hint: (error as any).hint
      })
      throw error
    }
    
    console.log('Checkout request added successfully:', data)
    // Map back
    return {
      id: data.id,
      userId: data.user_id,
      bookId: data.book_id,
      dueDate: data.due_date,
      status: data.status,
      createdAt: data.created_at
    }
  } catch (error) {
    console.error('Unexpected error in addCheckoutRequest:', error)
    throw error
  }
}

// Function to approve checkout request and create actual checkout
export async function approveCheckoutRequest(requestId: string, dueDate: string): Promise<boolean> {
  try {
    // Get the checkout request
    const { data: request, error: fetchError } = await supabase
      .from('checkout_requests')
      .select('*')
      .eq('id', requestId)
      .single()
    
    if (fetchError) {
      console.error('Error fetching checkout request:', fetchError)
      return false
    }
    
    // Create the actual checkout
    const checkoutData = {
      user_id: request.user_id,
      book_id: request.book_id,
      due_date: dueDate,
      status: 'approved'
    }
    
    const { error: checkoutError } = await supabase
      .from('checkouts')
      .insert([checkoutData])
    
    if (checkoutError) {
      console.error('Error creating checkout:', checkoutError)
      return false
    }
    
    // Update request status to approved
    const { error: updateError } = await supabase
      .from('checkout_requests')
      .update({ status: 'approved' })
      .eq('id', requestId)
    
    if (updateError) {
      console.error('Error updating request status:', updateError)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Unexpected error in approveCheckoutRequest:', error)
    return false
  }
}

// Function to reject checkout request
export async function rejectCheckoutRequest(requestId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('checkout_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId)
    
    if (error) {
      console.error('Error rejecting checkout request:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Unexpected error in rejectCheckoutRequest:', error)
    return false
  }
}

export async function addReview(reviewData: any): Promise<any> {
  try {
    console.log('Adding review:', reviewData)
    
    // Map the Review interface fields to database column names
    const mappedReviewData = {
      user_id: reviewData.userId,
      book_id: reviewData.bookId,
      rating: reviewData.rating,
      comment: reviewData.comment,
      date: (reviewData.date ? new Date(reviewData.date) : new Date()).toISOString().slice(0,10) // YYYY-MM-DD
    }
    
    const { data, error } = await supabase
      .from('reviews')
      .insert([mappedReviewData])
      .select()
      .single()
    
    if (error) {
      console.error('Error adding review:', { error, mappedReviewData })
      throw error
    }
    
    console.log('Review added successfully:', data)
    
    // Map back to interface fields
    return {
      id: data.id,
      userId: data.user_id,
      bookId: data.book_id,
      rating: data.rating,
      comment: data.comment,
      date: data.date
    }
  } catch (error) {
    console.error('Unexpected error in addReview:', error)
    throw error
  }
}

export async function initializeDatabase(useExpandedData?: boolean): Promise<{ success: boolean; message: string }> {
  return { success: false, message: 'Database seeder not implemented' }
}

// User Activities functions
export async function createUserActivity(activityData: Omit<UserActivity, 'id' | 'createdAt'>): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_activities')
      .insert({
        user_id: activityData.userId,
        activity_type: activityData.activityType,
        target_id: activityData.targetId,
        description: activityData.description,
      })
    
    if (error) {
      console.error('Error creating user activity:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in createUserActivity:', error)
    throw error
  }
}

export async function getUserActivities(userId: string, limit: number = 10): Promise<UserActivity[]> {
  try {
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching user activities:', error)
      return []
    }
    
    return data?.map(activity => ({
      id: activity.id,
      userId: activity.user_id,
      activityType: activity.activity_type,
      targetId: activity.target_id,
      description: activity.description,
      createdAt: activity.created_at,
    })) || []
  } catch (error) {
    console.error('Error in getUserActivities:', error)
    return []
  }
}

// User Favorites functions
export async function addUserFavorite(userId: string, bookId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: userId,
        book_id: bookId,
      })
    
    if (error) {
      console.error('Error adding favorite:', error)
      throw error
    }
    
    // Create activity
    await createUserActivity({
      userId,
      activityType: 'book_review', // We can extend this later
      targetId: bookId,
      description: 'Added book to favorites',
    })
  } catch (error) {
    console.error('Error in addUserFavorite:', error)
    throw error
  }
}

export async function removeUserFavorite(userId: string, bookId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('book_id', bookId)
    
    if (error) {
      console.error('Error removing favorite:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in removeUserFavorite:', error)
    throw error
  }
}

export async function getUserFavorites(userId: string): Promise<UserFavorite[]> {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        *,
        books:book_id (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching user favorites:', error)
      return []
    }
    
    return data?.map(favorite => ({
      id: favorite.id,
      userId: favorite.user_id,
      bookId: favorite.book_id,
      createdAt: favorite.created_at,
      book: favorite.books ? {
        id: favorite.books.id,
        title: favorite.books.title,
        author: favorite.books.author,
        description: favorite.books.description,
        coverUrl: favorite.books.cover_url,
        category: favorite.books.category,
        stock: favorite.books.stock,
      } : undefined
    })) || []
  } catch (error) {
    console.error('Error in getUserFavorites:', error)
    return []
  }
}

export async function getReviewsByUserId(userId: string): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        books:book_id (*),
        users:user_id (username, name, avatar_url)
      `)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error fetching user reviews:', error)
      return []
    }
    
    return data?.map(review => ({
      id: review.id,
      userId: review.user_id,
      bookId: review.book_id,
      rating: review.rating,
      comment: review.comment,
      date: review.date,
      user: review.users
        ? {
            username: review.users.username,
            name: review.users.name,
            avatarUrl: (review.users as any).avatar_url
          }
        : undefined,
      // Normalize book fields to camelCase where needed
      book: review.books
        ? {
            id: review.books.id,
            title: review.books.title,
            author: review.books.author,
            description: review.books.description,
            coverUrl: (review.books as any).cover_url || review.books.coverUrl,
            category: review.books.category,
            stock: review.books.stock
          }
        : undefined
    })) || []
  } catch (error) {
    console.error('Error in getReviewsByUserId:', error)
    return []
  }
}