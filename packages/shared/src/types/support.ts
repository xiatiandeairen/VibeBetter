export type SupportPriority = 'critical' | 'high' | 'medium' | 'low';
export type TicketStatus = 'open' | 'in_progress' | 'waiting_on_customer' | 'resolved' | 'closed';
export type TicketChannel = 'email' | 'chat' | 'web' | 'api' | 'phone';

export interface SupportTicket {
  id: string;
  organizationId: string;
  userId: string;
  subject: string;
  description: string;
  priority: SupportPriority;
  status: TicketStatus;
  channel: TicketChannel;
  assigneeId: string | null;
  tags: string[];
  attachments: TicketAttachment[];
  messages: TicketMessage[];
  firstResponseAt: Date | null;
  resolvedAt: Date | null;
  satisfactionRating: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: Date;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  authorId: string;
  authorType: 'customer' | 'agent' | 'system';
  body: string;
  attachments: TicketAttachment[];
  createdAt: Date;
}

export interface KnowledgeBase {
  id: string;
  organizationId: string;
  title: string;
  slug: string;
  articles: KnowledgeArticle[];
  categories: KnowledgeCategory[];
  defaultLocale: string;
  supportedLocales: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeArticle {
  id: string;
  knowledgeBaseId: string;
  categoryId: string | null;
  title: string;
  slug: string;
  body: string;
  locale: string;
  published: boolean;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeCategory {
  id: string;
  knowledgeBaseId: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  order: number;
  articleCount: number;
}
