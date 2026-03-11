/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// ============ Users ============
export interface User {
  address: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ============ Offers ============
export interface Offer {
  id: string;
  title: string;
  description?: string;
  stack?: string[];
  budgetTON: number;
  deadline?: string;
  status: string;
  creatorAddress: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string | null;
}

export interface ListOffersResponse {
  items: Offer[];
}

export interface CreateOfferRequest {
  title: string;
  description?: string;
  stack?: string[];
  budgetTON: number;
  deadline?: string;
}

// ============ Applications ============
export interface Application {
  id: string;
  offerId: string;
  freelancerAddress: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListApplicationsResponse {
  items: Application[];
}

export interface SelectExecutorRequest {
  offerId: string;
  applicationId: string;
}

// ============ Orders ============
export interface Order {
  id: string;
  offerId: string;
  creatorAddress: string;
  freelancerAddress: string;
  status: "in_progress" | "confirm" | "complete" | "cancel";
  makerDeposit: number;
  takerStake: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListOrdersResponse {
  items: Order[];
}

export interface CreateOrderRequest {
  offerId: string;
  freelancerAddress: string;
}

export interface UpdateOrderRequest {
  status: "in_progress" | "confirm" | "complete" | "cancel";
}

// ============ Conversations & Messaging ============
export interface Conversation {
  id: string;
  orderId: string;
  participantAddresses: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ListConversationsResponse {
  conversations?: Conversation[];
  items?: Conversation[];
}

export interface Message {
  id: string;
  conversationId?: string;
  createdAt: string;
  type: string;
  importance: string;
  channel: string;
  text: string;
  lang?: string;
  address?: string;
  meta?: Record<string, unknown>;
  unread: boolean;
}

export interface PaginationMetadata {
  hasMore: boolean;
  oldestTimestamp: string | null;
  count: number;
}

export interface ListMessagesResponse {
  items?: Message[];
  messages?: Message[];
  pagination?: PaginationMetadata;
}

export interface CreateMessageRequest {
  conversationId: string;
  content?: string;
  encryptedContent?: string;
  signature?: string;
}

// ============ Inbox ============
export interface InboxItem {
  id: string;
  recipientAddress: string;
  conversationId: string;
  type: "chat.message" | "chat.typing" | "chat.read" | "order.created" | "order.updated";
  payload: unknown;
  readAt?: string;
  createdAt: string;
}

export interface ListInboxResponse {
  items: InboxItem[];
}

export interface PostInboxRequest {
  recipientAddress: string;
  conversationId: string;
  type: string;
  payload: unknown;
}

// ============ Reviews & Ratings ============
export interface Review {
  id: string;
  rating: number; // 1-5
  comment?: string;
  orderId: string;
  authorAddress: string;
  revieweeAddress: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReviewRequest {
  orderId: string;
  rating: number; // 1-5
  comment?: string;
  revieweeAddress: string;
}

export interface UserStats {
  address: string;
  averageRating: number;
  totalReviews: number;
  completedOrders: number;
  responseTime?: number; // in minutes
}

export interface ListReviewsResponse {
  items: Review[];
}

export interface GetUserStatsResponse extends UserStats {}
