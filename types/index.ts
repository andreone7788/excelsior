// Auth Types
export type { RegisterInput, LoginInput } from "@/lib/validations/auth";

// Booking Types
export type { CreateBookingInput, UpdateBookingStatusInput } from "@/lib/validations/booking";

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