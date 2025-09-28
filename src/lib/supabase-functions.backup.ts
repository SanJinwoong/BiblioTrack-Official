import { supabase } from './supabase'
import type { Book, Checkout, User, Category, Review } from './types'
import { initialUsers, initialBooks, initialCategories, initialCheckouts, initialCheckoutRequests, initialReviews } from './data'
import { expandedUsers, expandedBooks, expandedCategories, expandedCheckouts, expandedCheckoutRequests, expandedReviews } from './expanded-data'

// Type definitions for initial data
type InitialCheckout = Omit<Checkout, 'id' | 'bookId'> & { bookTitle: string }
type InitialReview = Omit<Review, 'id' | 'bookId'> & { bookTitle: string }

// Helper function to initialize database with sample data
export async function initializeDatabase(useExpandedData: boolean = false) {
  try {
    console.log(`🔧 Initializing database${useExpandedData ? ' with expanded data' : ''}...`)
    
    const usersData = useExpandedData ? expandedUsers : initialUsers
    const booksData = useExpandedData ? expandedBooks : initialBooks
    const categoriesData = useExpandedData ? expandedCategories : initialCategories
    const checkoutsData = useExpandedData ? expandedCheckouts : initialCheckouts
    const checkoutRequestsData = useExpandedData ? expandedCheckoutRequests : initialCheckoutRequests
    const reviewsData = useExpandedData ? expandedReviews : initialReviews

    console.log('🗑️ Clearing existing data...')
    
    // Clear existing data in correct order (foreign keys)
    await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('checkout_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('checkouts').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('books').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    console.log('✅ Existing data cleared')

    // Initialize categories first
    console.log('📂 Inserting categories...')
    const categoriesResult = await supabase.from('categories').insert(categoriesData.map(cat => ({ name: cat.name }))).select()
    if (categoriesResult.error) {
      throw new Error(`Categories insert failed: ${categoriesResult.error.message}`)
    }
    console.log(`✅ Inserted ${categoriesResult.data?.length || 0} categories`)

    // Initialize users
    console.log('👥 Inserting users...')
    const usersToInsert = usersData.map(user => ({
      username: user.username,
      password: user.password || 'password',
      role: user.role,
      name: user.name || null,
      curp: user.curp || null,
      phone: user.phone || null,
      email: user.email || null,
      address: user.address || null,
      status: user.status || 'active',
      avatar_url: user.avatarUrl || null,
      banner_url: user.bannerUrl || null,
      bio: user.bio || null,
      favorite_books: user.favoriteBooks || null,
      following: user.following || null,
      followers: user.followers || null,
      books_read: user.books_read || null,
      created_at: user.createdAt || new Date().toISOString()
    }))

    const usersResult = await supabase.from('users').insert(usersToInsert).select()
    if (usersResult.error) {
      throw new Error(`Users insert failed: ${usersResult.error.message}`)
    }
    console.log(`✅ Inserted ${usersResult.data?.length || 0} users`)

    // Initialize books
    console.log('📚 Inserting books...')
    const booksToInsert = booksData.map(book => ({
      title: book.title,
      author: book.author,
      description: book.description,
      cover_url: book.coverUrl,
      category: book.category,
      stock: book.stock
    }))

    const booksResult = await supabase.from('books').insert(booksToInsert).select()
    if (booksResult.error) {
      throw new Error(`Books insert failed: ${booksResult.error.message}`)
    }
    console.log(`✅ Inserted ${booksResult.data?.length || 0} books`)

    // Create book title to ID mapping for checkouts and reviews
    const bookTitleToId: { [key: string]: string } = {}
    if (booksResult.data) {
      for (const book of booksResult.data) {
        bookTitleToId[book.title] = book.id
      }
    }

    // Create user username to ID mapping
    const userUsernameToId: { [key: string]: string } = {}
    if (usersResult.data) {
      for (const user of usersResult.data) {
        userUsernameToId[user.username] = user.id
      }
    }

    // Initialize checkouts
    if (checkoutsData.length > 0) {
      console.log('📋 Inserting checkouts...')
      const checkoutsToInsert = (checkoutsData as any[]).map(checkout => ({
        user_id: userUsernameToId[checkout.userId] || checkout.userId,
        book_id: bookTitleToId[checkout.bookTitle || checkout.bookId] || checkout.bookId,
        due_date: checkout.dueDate,
        status: checkout.status
      })).filter(checkout => checkout.user_id && checkout.book_id)

      if (checkoutsToInsert.length > 0) {
        const checkoutsResult = await supabase.from('checkouts').insert(checkoutsToInsert)
        if (checkoutsResult.error) {
          console.warn(`Checkouts insert warning: ${checkoutsResult.error.message}`)
        } else {
          console.log(`✅ Inserted ${checkoutsToInsert.length} checkouts`)
        }
      }
    }

    // Initialize checkout requests
    if (checkoutRequestsData.length > 0) {
      console.log('📝 Inserting checkout requests...')
      const checkoutRequestsToInsert = (checkoutRequestsData as any[]).map(request => ({
        user_id: userUsernameToId[request.userId] || request.userId,
        book_id: bookTitleToId[request.bookTitle || request.bookId] || request.bookId,
        due_date: request.dueDate,
        status: request.status
      })).filter(request => request.user_id && request.book_id)

      if (checkoutRequestsToInsert.length > 0) {
        const requestsResult = await supabase.from('checkout_requests').insert(checkoutRequestsToInsert)
        if (requestsResult.error) {
          console.warn(`Checkout requests insert warning: ${requestsResult.error.message}`)
        } else {
          console.log(`✅ Inserted ${checkoutRequestsToInsert.length} checkout requests`)
        }
      }
    }

    // Initialize reviews
    if (reviewsData.length > 0) {
      console.log('⭐ Inserting reviews...')
      const reviewsToInsert = (reviewsData as any[]).map(review => ({
        user_id: userUsernameToId[review.userId] || review.userId,
        book_id: bookTitleToId[review.bookTitle || review.bookId] || review.bookId,
        rating: review.rating,
        comment: review.comment,
        date: review.date
      })).filter(review => review.book_id && review.user_id)

      if (reviewsToInsert.length > 0) {
        const reviewsResult = await supabase.from('reviews').insert(reviewsToInsert)
        if (reviewsResult.error) {
          console.warn(`Reviews insert warning: ${reviewsResult.error.message}`)
        } else {
          console.log(`✅ Inserted ${reviewsToInsert.length} reviews`)
        }
      }
    }

    console.log(`🎉 Database initialization ${useExpandedData ? '(expanded) ' : ''}completed successfully!`)
    return { success: true, message: 'Database initialized successfully' }
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    throw error
  }
}

    // Initialize books
    const booksToInsert = booksData.map(book => ({
      title: book.title,
      author: book.author,
      description: book.description,
      cover_url: book.coverUrl,
      category: book.category,
      stock: book.stock
    }))

    await supabase.from('books').upsert(booksToInsert, { onConflict: 'title' })

    // Get book IDs for checkouts
    const { data: books } = await supabase.from('books').select('id, title')
    const bookTitleToId = books?.reduce((acc, book) => {
      acc[book.title] = book.id
      return acc
    }, {} as Record<string, string>) || {}

    // Initialize checkouts
    const checkoutsToInsert = (checkoutsData as unknown as InitialCheckout[]).map(checkout => ({
      user_id: checkout.userId,
      book_id: bookTitleToId[checkout.bookTitle],
      due_date: checkout.dueDate,
      status: checkout.status
    })).filter(checkout => checkout.book_id)

    if (checkoutsToInsert.length > 0) {
      await supabase.from('checkouts').insert(checkoutsToInsert)
    }

    // Initialize checkout requests
    const checkoutRequestsToInsert = (checkoutRequestsData as unknown as InitialCheckout[]).map(checkout => ({
      user_id: checkout.userId,
      book_id: bookTitleToId[checkout.bookTitle],
      due_date: checkout.dueDate,
      status: checkout.status
    })).filter(checkout => checkout.book_id)

    if (checkoutRequestsToInsert.length > 0) {
      await supabase.from('checkout_requests').insert(checkoutRequestsToInsert)
    }

    // Initialize reviews
    const reviewsToInsert = (reviewsData as unknown as InitialReview[]).map(review => ({
      user_id: review.userId,
      book_id: bookTitleToId[review.bookTitle],
      rating: review.rating,
      comment: review.comment,
      date: review.date
    })).filter(review => review.book_id)

    if (reviewsToInsert.length > 0) {
      await supabase.from('reviews').insert(reviewsToInsert)
    }

    console.log(`Database initialized successfully${useExpandedData ? ' with expanded data' : ''}!`)
    return { success: true, message: 'Database initialized successfully' }
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}

// User functions
export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return data?.map(user => ({
    id: user.id,
    username: user.username,
    password: user.password,
    role: user.role,
    name: user.name || undefined,
    curp: user.curp || undefined,
    phone: user.phone || undefined,
    email: user.email || undefined,
    address: user.address || undefined,
    status: user.status,
    avatarUrl: user.avatar_url || undefined,
    bannerUrl: user.banner_url || undefined,
    bio: user.bio || undefined,
    favoriteBooks: user.favorite_books || undefined,
    following: user.following || undefined,
    followers: user.followers || undefined,
    createdAt: user.created_at || undefined
  })) || []
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  if (!data) return null

  return {
    id: data.id,
    username: data.username,
    password: data.password,
    role: data.role,
    name: data.name || undefined,
    curp: data.curp || undefined,
    phone: data.phone || undefined,
    email: data.email || undefined,
    address: data.address || undefined,
    status: data.status,
    avatarUrl: data.avatar_url || undefined,
    bannerUrl: data.banner_url || undefined,
    bio: data.bio || undefined,
    favoriteBooks: data.favorite_books || undefined,
    following: data.following || undefined,
    followers: data.followers || undefined,
    createdAt: data.created_at || undefined
  }
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()

  if (error) {
    console.error('Error fetching user by username:', error)
    return null
  }

  if (!data) return null

  return {
    id: data.id,
    username: data.username,
    password: data.password,
    role: data.role,
    name: data.name || undefined,
    curp: data.curp || undefined,
    phone: data.phone || undefined,
    email: data.email || undefined,
    address: data.address || undefined,
    status: data.status,
    avatarUrl: data.avatar_url || undefined,
    bannerUrl: data.banner_url || undefined,
    bio: data.bio || undefined,
    favoriteBooks: data.favorite_books || undefined,
    following: data.following || undefined,
    followers: data.followers || undefined,
    createdAt: data.created_at || undefined
  }
}

export async function addUser(user: Omit<User, 'id'>): Promise<boolean> {
  const { error } = await supabase
    .from('users')
    .insert({
      username: user.username,
      password: user.password,
      role: user.role,
      name: user.name,
      curp: user.curp,
      phone: user.phone,
      email: user.email,
      address: user.address,
      status: user.status || 'active',
      avatar_url: user.avatarUrl,
      banner_url: user.bannerUrl,
      bio: user.bio,
      favorite_books: user.favoriteBooks || [],
      following: user.following || [],
      followers: user.followers || [],
      created_at: user.createdAt || new Date().toISOString()
    })

  if (error) {
    console.error('Error adding user:', error)
    return false
  }

  return true
}

export async function updateUser(id: string, updates: Partial<User>): Promise<boolean> {
  const { error } = await supabase
    .from('users')
    .update({
      name: updates.name,
      curp: updates.curp,
      phone: updates.phone,
      email: updates.email,
      address: updates.address,
      status: updates.status,
      avatar_url: updates.avatarUrl,
      banner_url: updates.bannerUrl,
      bio: updates.bio,
      favorite_books: updates.favoriteBooks,
      following: updates.following,
      followers: updates.followers
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating user:', error)
    return false
  }

  return true
}

// Book functions
export async function getBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('title', { ascending: true })

  if (error) {
    console.error('Error fetching books:', error)
    return []
  }

  return data?.map(book => ({
    id: book.id,
    title: book.title,
    author: book.author,
    description: book.description,
    coverUrl: book.cover_url,
    category: book.category,
    stock: book.stock
  })) || []
}

export async function getBookById(id: string): Promise<Book | null> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching book:', error)
    return null
  }

  if (!data) return null

  return {
    id: data.id,
    title: data.title,
    author: data.author,
    description: data.description,
    coverUrl: data.cover_url,
    category: data.category,
    stock: data.stock
  }
}

export async function addBook(book: Omit<Book, 'id'>): Promise<boolean> {
  const { error } = await supabase
    .from('books')
    .insert({
      title: book.title,
      author: book.author,
      description: book.description,
      cover_url: book.coverUrl,
      category: book.category,
      stock: book.stock
    })

  if (error) {
    console.error('Error adding book:', error)
    return false
  }

  return true
}

export async function updateBook(id: string, updates: Partial<Book>): Promise<boolean> {
  const { error } = await supabase
    .from('books')
    .update({
      title: updates.title,
      author: updates.author,
      description: updates.description,
      cover_url: updates.coverUrl,
      category: updates.category,
      stock: updates.stock
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating book:', error)
    return false
  }

  return true
}

export async function deleteBook(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting book:', error)
    return false
  }

  return true
}

// Category functions
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data?.map(category => ({
    id: category.id,
    name: category.name
  })) || []
}

// Checkout functions
export async function getCheckouts(): Promise<Checkout[]> {
  const { data, error } = await supabase
    .from('checkouts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching checkouts:', error)
    return []
  }

  return data?.map(checkout => ({
    id: checkout.id,
    userId: checkout.user_id,
    bookId: checkout.book_id,
    dueDate: checkout.due_date,
    status: checkout.status
  })) || []
}

export async function getCheckoutsByUserId(userId: string): Promise<Checkout[]> {
  const { data, error } = await supabase
    .from('checkouts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user checkouts:', error)
    return []
  }

  return data?.map(checkout => ({
    id: checkout.id,
    userId: checkout.user_id,
    bookId: checkout.book_id,
    dueDate: checkout.due_date,
    status: checkout.status
  })) || []
}

export async function addCheckout(checkout: Omit<Checkout, 'id'>): Promise<boolean> {
  const { error } = await supabase
    .from('checkouts')
    .insert({
      user_id: checkout.userId,
      book_id: checkout.bookId,
      due_date: checkout.dueDate,
      status: checkout.status
    })

  if (error) {
    console.error('Error adding checkout:', error)
    return false
  }

  return true
}

export async function updateCheckout(id: string, updates: Partial<Checkout>): Promise<boolean> {
  const { error } = await supabase
    .from('checkouts')
    .update({
      status: updates.status,
      due_date: updates.dueDate
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating checkout:', error)
    return false
  }

  return true
}

export async function deleteCheckout(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('checkouts')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting checkout:', error)
    return false
  }

  return true
}

// Review functions
export async function getReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching reviews:', error)
    return []
  }

  return data?.map(review => ({
    id: review.id,
    userId: review.user_id,
    bookId: review.book_id,
    rating: review.rating,
    comment: review.comment,
    date: review.date
  })) || []
}

export async function getReviewsByUserId(userId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching reviews by user:', error)
    return []
  }

  return data?.map(review => ({
    id: review.id,
    userId: review.user_id,
    bookId: review.book_id,
    rating: review.rating,
    comment: review.comment,
    date: review.date
  })) || []
}

export async function getReviewsByBookId(bookId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('book_id', bookId)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching book reviews:', error)
    return []
  }

  return data?.map(review => ({
    id: review.id,
    userId: review.user_id,
    bookId: review.book_id,
    rating: review.rating,
    comment: review.comment,
    date: review.date
  })) || []
}

export async function addReview(review: Omit<Review, 'id'>): Promise<boolean> {
  const { error } = await supabase
    .from('reviews')
    .insert({
      user_id: review.userId,
      book_id: review.bookId,
      rating: review.rating,
      comment: review.comment,
      date: review.date
    })

  if (error) {
    console.error('Error adding review:', error)
    return false
  }

  return true
}

// Checkout Requests functions
export async function getCheckoutRequests(): Promise<Checkout[]> {
  const { data, error } = await supabase
    .from('checkout_requests')
    .select('*')

  if (error) {
    console.error('Error getting checkout requests:', error)
    return []
  }

  return data?.map(request => ({
    id: request.id,
    userId: request.user_id,
    bookId: request.book_id,
    dueDate: request.due_date,
    status: request.status
  })) || []
}

export async function addCheckoutRequest(request: Omit<Checkout, 'id'>): Promise<boolean> {
  const { error } = await supabase
    .from('checkout_requests')
    .insert({
      user_id: request.userId,
      book_id: request.bookId,
      due_date: request.dueDate,
      status: request.status
    })

  if (error) {
    console.error('Error adding checkout request:', error)
    return false
  }

  return true
}

export async function deleteCheckoutRequest(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('checkout_requests')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting checkout request:', error)
    return false
  }

  return true
}

// Follow System Functions
export async function followUser(currentUserId: string, targetUsername: string): Promise<boolean> {
  try {
    const [currentUser, targetUser] = await Promise.all([
      getUserById(currentUserId),
      getUserByUsername(targetUsername)
    ]);

    if (!currentUser || !targetUser || currentUser.id === targetUser.id) {
      return false;
    }

    // Check if already following to prevent duplicates
    if (currentUser.following?.includes(targetUsername)) {
      return true; // Already following, no change needed
    }

    // Update both users atomically
    const newFollowing = [...(currentUser.following || []), targetUsername];
    const newFollowers = [...(targetUser.followers || []), currentUser.username];

    // Remove duplicates just in case
    const uniqueFollowing = [...new Set(newFollowing)];
    const uniqueFollowers = [...new Set(newFollowers)];

    await Promise.all([
      updateUser(currentUser.id, { following: uniqueFollowing }),
      updateUser(targetUser.id, { followers: uniqueFollowers })
    ]);

    return true;
  } catch (error) {
    console.error('Error following user:', error);
    return false;
  }
}

export async function unfollowUser(currentUserId: string, targetUsername: string): Promise<boolean> {
  try {
    const [currentUser, targetUser] = await Promise.all([
      getUserById(currentUserId),
      getUserByUsername(targetUsername)
    ]);

    if (!currentUser || !targetUser) {
      return false;
    }

    // Update both users atomically
    const newFollowing = (currentUser.following || []).filter(f => f !== targetUsername);
    const newFollowers = (targetUser.followers || []).filter(f => f !== currentUser.username);

    await Promise.all([
      updateUser(currentUser.id, { following: newFollowing }),
      updateUser(targetUser.id, { followers: newFollowers })
    ]);

    return true;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return false;
  }
}

export async function getFollowers(username: string): Promise<User[]> {
  try {
    const user = await getUserByUsername(username);
    if (!user?.followers) return [];

    const followers = await Promise.all(
      user.followers.map(followerUsername => getUserByUsername(followerUsername))
    );

    return followers.filter(follower => follower !== null) as User[];
  } catch (error) {
    console.error('Error getting followers:', error);
    return [];
  }
}

export async function getFollowing(username: string): Promise<User[]> {
  try {
    const user = await getUserByUsername(username);
    if (!user?.following) return [];

    const following = await Promise.all(
      user.following.map(followingUsername => getUserByUsername(followingUsername))
    );

    return following.filter(follow => follow !== null) as User[];
  } catch (error) {
    console.error('Error getting following:', error);
    return [];
  }
}