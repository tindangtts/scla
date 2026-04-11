"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import bcrypt from "bcryptjs";

export async function register(
  prevState: { error?: string },
  formData: FormData
) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!name || !email || !phone || !password || !confirmPassword) {
    return { error: "All fields are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone,
        user_type: "guest",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Sync user to app database
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await db.insert(usersTable).values({
      name,
      email,
      phone,
      passwordHash,
      userType: "guest",
    });
  } catch {
    // If DB insert fails, user is still created in Supabase Auth.
    // Log but don't block the registration flow.
    console.error("Failed to sync user to app database");
  }

  revalidatePath("/", "layout");
  redirect("/");
}
