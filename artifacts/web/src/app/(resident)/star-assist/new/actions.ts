"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { usersTable, ticketsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getNextTicketNumber } from "@/lib/queries/tickets";

const VALID_CATEGORIES = [
  "electricals",
  "plumbing",
  "housekeeping",
  "general_enquiry",
  "air_conditioning",
  "pest_control",
  "civil_works",
  "other",
] as const;

const VALID_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5_000_000; // 5MB

export async function createTicket(
  prevState: { error?: string; success?: boolean; ticketId?: string },
  formData: FormData,
): Promise<{ error?: string; success?: boolean; ticketId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const title = (formData.get("title") as string)?.trim();
  const category = formData.get("category") as string;
  const serviceType = (formData.get("serviceType") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const attachment = formData.get("attachment") as File | null;

  // Validation
  if (!title || title.length < 3 || title.length > 200) {
    return { error: "Title must be between 3 and 200 characters." };
  }

  if (!category || !VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])) {
    return { error: "Please select a valid category." };
  }

  if (!serviceType) {
    return { error: "Service type is required." };
  }

  if (!description || description.length < 10 || description.length > 2000) {
    return {
      error: "Description must be between 10 and 2000 characters.",
    };
  }

  // Get DB user
  const dbUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, user.email!))
    .limit(1);

  if (dbUsers.length === 0) {
    return { error: "User not found in database." };
  }

  const dbUser = dbUsers[0];

  // Handle photo attachment
  let attachmentUrl: string | null = null;
  if (attachment && attachment.size > 0) {
    if (!VALID_IMAGE_TYPES.includes(attachment.type)) {
      return {
        error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed.",
      };
    }
    if (attachment.size > MAX_FILE_SIZE) {
      return { error: "File too large. Maximum size is 5MB." };
    }

    const buffer = await attachment.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    attachmentUrl = `data:${attachment.type};base64,${base64}`;
  }

  // Generate ticket number
  const ticketNumber = await getNextTicketNumber();

  // Insert ticket
  const result = await db
    .insert(ticketsTable)
    .values({
      ticketNumber,
      userId: dbUser.id,
      title,
      category: category as (typeof VALID_CATEGORIES)[number],
      serviceType,
      status: "open",
      unitNumber: dbUser.unitNumber,
      description,
      attachmentUrl,
      updates: [],
    })
    .returning({ id: ticketsTable.id });

  const newTicketId = result[0].id;

  revalidatePath("/star-assist");
  revalidatePath("/");

  return { success: true, ticketId: newTicketId };
}
