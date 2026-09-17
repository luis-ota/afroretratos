export type EventStatus = "upcoming" | "finished" | "cancelled";
export type PostStatus = "active" | "hidden" | "removed";

export type PublicEvent = {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string | null;
  startsAt: string;
  endsAt: string | null;
  venue: string;
  location: string;
  status: EventStatus;
};

export type EventOption = {
  id: string;
  slug: string;
  title: string;
  startsAt: string;
  status: EventStatus;
};

/**
 * Versao publica de um post. Nao inclui ip_hash, ip_encrypted, user_agent
 * nem qualquer outro dado tecnico do usuario.
 */
export type PublicPost = {
  id: string;
  content: string;
  createdAt: string;
  event: { slug: string; title: string } | null;
};

export type ModerationPost = PublicPost & {
  status: PostStatus;
  ipHash: string;
  ipEncrypted: string | null;
  contactEncrypted: string | null;
  userAgent: string | null;
  hasIp: boolean;
};

export type BlockedOrigin = {
  id: string;
  ipHash: string;
  reason: string;
  blockedAt: string;
  expiresAt: string | null;
  createdBy: string | null;
};

export type ReportRecord = {
  id: string;
  postId: string;
  postExcerpt: string;
  reason: string;
  createdAt: string;
};
