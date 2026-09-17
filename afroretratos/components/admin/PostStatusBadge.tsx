import type { PostStatus } from "@/lib/types";

const LABELS: Record<PostStatus, string> = {
  active: "Ativo",
  hidden: "Oculto",
  removed: "Removido",
};

const STYLES: Record<PostStatus, string> = {
  active: "border-olive text-olive",
  hidden: "border-brown text-brown",
  removed: "border-wine bg-wine text-beige",
};

export function PostStatusBadge({ status }: { status: PostStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-[0.6875rem] font-medium tracking-[0.1em] uppercase ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
