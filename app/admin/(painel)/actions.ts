"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guard";
import type { PostStatus } from "@/lib/types";
import {
  blockOrigin,
  removePostsByOrigin,
  setPostStatus,
  unblockOrigin,
} from "@/services/moderation";

const STATUSES: PostStatus[] = ["active", "hidden", "removed"];

function adminPath(value: FormDataEntryValue | null, fallback: string): string {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/admin") ? path : fallback;
}

function revalidateModeration(): void {
  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  revalidatePath("/admin/origens");
  revalidatePath("/admin/denuncias");
  revalidatePath("/feed");
}

export async function updatePostStatusAction(
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const postId = String(formData.get("postId") ?? "");
  const status = String(formData.get("status") ?? "") as PostStatus;
  const returnTo = adminPath(formData.get("returnTo"), "/admin/posts");

  if (postId && STATUSES.includes(status)) {
    await setPostStatus(postId, status);
    revalidatePath(`/admin/posts/${postId}`);
    revalidateModeration();
  }

  redirect(returnTo);
}

export async function removeOriginPostsAction(
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const ipHash = String(formData.get("ipHash") ?? "");
  const returnTo = adminPath(formData.get("returnTo"), "/admin/posts");

  if (ipHash) {
    await removePostsByOrigin(ipHash);
    revalidateModeration();
  }

  redirect(returnTo);
}

export async function blockOriginAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const ipHash = String(formData.get("ipHash") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const duration = String(formData.get("duration") ?? "permanent");
  const returnTo = adminPath(formData.get("returnTo"), "/admin/origens");

  if (!ipHash || reason.length < 3) {
    redirect(returnTo);
  }

  const days = duration === "1d" ? 1 : duration === "7d" ? 7 : duration === "30d" ? 30 : 0;
  const expiresAt =
    days > 0 ? new Date(Date.now() + days * 24 * 60 * 60 * 1000) : null;

  await blockOrigin({
    ipHash,
    reason: reason.slice(0, 300),
    expiresAt,
    createdBy: "ADMIN_SECRET",
  });
  revalidateModeration();
  redirect(returnTo);
}

export async function unblockOriginAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const ipHash = String(formData.get("ipHash") ?? "");
  const returnTo = adminPath(formData.get("returnTo"), "/admin/origens");

  if (ipHash) {
    await unblockOrigin(ipHash);
    revalidateModeration();
  }

  redirect(returnTo);
}
