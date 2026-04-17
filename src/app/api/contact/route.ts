import { NextResponse } from "next/server";
import { z } from "zod";

import { sendContactInquiryEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const contactSchema = z.object({
  firstName: z.string().trim().min(2, "First name is too short"),
  lastName: z.string().trim().min(2, "Last name is too short"),
  email: z.email("Enter a valid email address"),
  subject: z.string().trim().min(3, "Subject is too short"),
  message: z.string().trim().min(10, "Message is too short"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || "Invalid contact payload";
      return NextResponse.json({ success: false, error: firstIssue }, { status: 400 });
    }

    await sendContactInquiryEmail(parsed.data);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Contact email error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

