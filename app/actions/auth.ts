"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  await auth.api.signUpEmail({
    body: { email, password, name },
  });

  redirect("/");
}

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  await auth.api.signInEmail({
    body: { email, password },
  });

  redirect("/");
}

export async function signInActionForResult(email: string, password: string) {
  try {
    const result = await auth.api.signInEmail({
      body: { email, password },
    });

    if (result) {
      return {
        success: true,
        message: "Login successful",
        user: result.user,
      };
    } else {
      return {
        success: false,
        message: "Invalid credentials",
      };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred during login";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function signUpActionForResult(
  email: string,
  password: string,
  name: string
) {
  try {
    const result = await auth.api.signUpEmail({
      body: { email, password, name },
    });

    if (result) {
      return {
        success: true,
        message: "Account created successfully",
        user: result.user,
      };
    } else {
      return {
        success: false,
        message: "Failed to create account",
      };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An error occurred during signup";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });

  redirect("/");
}
