// Auth Types
export type { RegisterInput, LoginInput } from "@/lib/validations/auth";

// Booking Types
export type { CreateBookingInput, UpdateBookingStatusInput, RequestBookingModificationInput } from "@/lib/validations/booking";

// Room Types
export type { CreateRoomInput, UpdateRoomInput, RoomFiltersInput } from "@/lib/validations/room";

// Chat Types
export type { SendMessageInput, AdminReplyInput, AIChatInput, AISuggestInput, AISuggestReplyInput } from "@/lib/validations/chat";

// User Types
export type { CreateUserInput, UpdateUserInput, DeleteUserInput, UpdateProfileInput, UpdatePasswordInput } from "@/lib/validations/user";

// Conversation Types
export type { CreateConversationInput, UpdateConversationStatusInput, DeleteConversationInput } from "@/lib/validations/conversation";


// Email Types
export type EmailTemplate =
    | 'booking-confirmation'
    | 'booking-pending'
    | 'booking-cancelled'
    | 'admin-new-booking'

export type EmailNotification = {
    to: string
    subject: string
    template: EmailTemplate
    data: {
        userName?: string
        roomName?: string
        startDate?: string
        endDate?: string
        bookingId?: number
        [key: string]: unknown
    }
}

// ==================== DATABASE ENTITIES (API RESPONSES) ====================

/**
 * User entity (da database)
 */
export interface User {
    id: number
    name: string
    surname: string
    email: string
    phone?: string | null 
    role: 'USER' | 'ADMIN'
    createdAt: string
    updatedAt: string
}

/**
 * User statistics (per useUserStats)
 */
export interface UserStats {
    totalBookings: number
    upcomingBookings: number
    completedBookings: number
    cancelledBookings: number
    totalSpent: number
}

/**
 * Room entity (da database)
 */
export interface Room {
    id: number
    name: string
    description: string
    price: number
    capacity: number
    amenities: string[]
    available: boolean
    createdAt: string
    updatedAt: string
}

/**
 * Booking status enum
 */
export type BookingStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'CANCELLED'
    | 'PENDING_MODIFICATION'
    | 'REPLACED'

/**
 * Booking entity (da database)
 */
export interface Booking {
    id: number
    userId: number
    roomId: number
    checkIn: string
    checkOut: string
    guests: number
    status: BookingStatus
    notes?: string
    createdAt: string
    updatedAt: string
    totalPrice: number
    // Relations (quando inclusa con Prisma)
    user?: User
    room?: Room
}
/**
 * Booking modification entity (da database)
 */
export interface RequestModificationInput {
    newStartDate?: string
    newEndDate?: string
    newRoomId?: number
    reason?: string
}

/**
 * Message role enum
 */
export type MessageRole = 'USER' | 'ADMIN'

/**
 * Message entity (da database)
 */
export interface Message {
    id: number
    conversationId: number
    role: MessageRole
    content: string
    createdAt: string
}

/**
 * Conversation status enum
 */
export type ConversationStatus = 'OPEN' | 'CLOSED'

/**
 * Conversation entity (da database)
 */
export interface Conversation {
    id: number
    userId: number
    title: string
    lastMessageAt: string
    createdAt: string
    updatedAt: string
    status: ConversationStatus
    // Relations (quando inclusa con Prisma)
    user?: User
    messages?: Message[]
    _count?: {
        messages: number
    }
}

/**
 * Conversation with messages (per useConversation)
 */
export interface ConversationWithMessages extends Conversation {
    messages: Message[]
}

/**
 * AI suggest rooms preferences (per useAISuggestRooms)
 */
export interface AISuggestPreferences {
    budget?: number
    roomType?: string
    amenities?: string[]
    guests?: number
}

// ==================== API RESPONSE TYPES ====================

/**
 * Auth response (login/register)
 */
export interface AuthResponse {
    user: User
    token: string
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
    data: T
    message?: string
    error?: string
    success?: boolean
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

/**
 * User profile response (GET /api/user/me)
 */
export interface UserProfileResponse {
    user: User
}

/**
 * Room detail with availability
 */
export interface RoomWithAvailability extends Room {
    isAvailable?: boolean
    nextAvailableDate?: string
}

/**
 * Booking with relations
 */
export interface BookingWithRelations extends Booking {
    user: User
    room: Room
}

// ==================== DASHBOARD/STATS TYPES ====================

/**
 * Admin dashboard stats
 */
export interface AdminDashboardStats {
    totalUsers: number
    totalRooms: number
    totalBookings: number
    totalRevenue: number
    todayCheckIns: number
    todayCheckOuts: number
    bookingsByStatus: {
        PENDING: number
        CONFIRMED: number
        CANCELLED: number
        PENDING_MODIFICATION: number
        REPLACED: number
    }
}

/**
 * User dashboard stats
 */
export interface UserDashboardStats {
    upcomingBookings: number
    pastBookings: number
    activeConversations: number
    totalSpent: number
}

// ==================== AI TYPES ====================

/**
 * AI chat response
 */
export interface AIChatResponse {
    response: string
    timestamp: string[]
}

/**
 * AI suggest rooms response
 */
export interface AISuggestRoomsResponse {
    suggestion: string
    roomIds: number[]
    rooms?: Room[]
}

/**
 * AI suggest admin reply response
 */
export interface AISuggestAdminReplyResponse {
    suggestion: string
}

/**
 * AI Room Suggestion Response
 */
export interface AIRoomSuggestion {
  room: Room
  matchScore: number
  reasoning: string
}

/**
 * AI Suggest Rooms Response
 */
export interface AISuggestRoomsResponse {
  suggestions: AIRoomSuggestion[]
  totalMatches: number
}

// ==================== UI/FORM STATE TYPES ====================

/**
 * Form field error
 */
export interface FieldError {
    field: string
    message: string
}

/**
 * Generic loading state
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'failed'

/**
 * Filter state per room search
 */
export interface RoomSearchFilters {
    capacity?: number
    minPrice?: number
    maxPrice?: number
    amenities?: string[]
    available?: boolean
    sortBy?: 'price' | 'capacity' | 'createdAt'
    sortOrder?: 'asc' | 'desc'
}

/**
 * Booking search filters
 */
export interface BookingSearchFilters {
    status?: BookingStatus
    startDate?: string
    endDate?: string
    userId?: number
    roomId?: number
}

/**
 * Date range
 */
export interface DateRange {
    from: string
    to: string
}

/**
 * Notification type
 */
export type NotificationType = 'success' | 'error' | 'info' | 'warning'

/**
 * Notification object
 */
export interface Notification {
    id: number
    type: NotificationType
    message: string
    duration?: number // in milliseconds
}