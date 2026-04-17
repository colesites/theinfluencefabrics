import { NextResponse } from "next/server";
import { z } from "zod";

import { sendNewsletterSubscriptionEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const newsletterSchema = z.object({
  email: z.email("Enter a valid email address"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = newsletterSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || "Invalid newsletter payload";
      return NextResponse.json({ success: false, error: firstIssue }, { status: 400 });
    }

    await sendNewsletterSubscriptionEmail(parsed.data);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Newsletter email error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

