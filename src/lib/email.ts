import "server-only";

import { Resend } from "resend";

type OrderEmailItem = {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
};

type AdminOrderNotificationPayload = {
  orderNumber: string;
  paymentMethod: string;
  status: string;
  totalPrice: number;
  customer: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  items: OrderEmailItem[];
};

type CustomerOrderStatusPayload = {
  orderNumber: string;
  email: string;
  name?: string;
  status: string;
  paymentMethod?: string;
  totalPrice?: number;
};

type CustomerOrderReceivedPayload = {
  orderNumber: string;
  email: string;
  name?: string;
  paymentMethod: "transfer" | "paystack";
  totalPrice: number;
  shippingToBeDeterminedAtPark?: boolean;
};

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || "Influence Fabrics <onboarding@resend.dev>";
const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
const appUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const newsletterGeneralSegmentId =
  process.env.RESEND_NEWSLETTER_SEGMENT_ID ||
  process.env.RESEND_GENERAL_SEGMENT_ID ||
  process.env.RESEND_NEWSLETTER_AUDIENCE_ID ||
  process.env.RESEND_GENERAL_AUDIENCE_ID;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

function normalizeStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function toDisplayName(name?: string) {
  const trimmed = name?.trim();
  if (!trimmed) return "Customer";
  if (/^(hello|hi|hey)$/i.test(trimmed)) return "Customer";
  return trimmed
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function getStatusHeadline(status: string) {
  if (status === "approved") return "Your Payment Has Been Approved";
  if (status === "shipped") return "Your Order Has Been Shipped";
  if (status === "delivered") return "Your Order Has Been Delivered";
  return `Order Status: ${normalizeStatus(status)}`;
}

function getStatusMessage(status: string, paymentMethod?: string) {
  if (status === "approved" && paymentMethod === "transfer") {
    return "We have reviewed your transfer receipt and confirmed your payment.";
  }
  if (status === "shipped") {
    return "Your order is currently in transit.";
  }
  if (status === "delivered") {
    return "Your order has been delivered. Thank you for shopping with us.";
  }
  return "Your order status has been updated.";
}

async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}) {
  if (!resend) throw new Error("RESEND_API_KEY is missing.");

  const { error } = await resend.emails.send({
    from: fromEmail,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(error.message || "Failed to send email via Resend");
  }

  return { sent: true };
}

export async function sendContactInquiryEmail(payload: {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}) {
  if (!adminEmail) throw new Error("ADMIN_NOTIFICATION_EMAIL is missing.");

  const fullName = `${payload.firstName} ${payload.lastName}`.trim();
  return sendEmail({
    to: adminEmail,
    subject: `Contact Inquiry: ${payload.subject}`,
    text: `New contact inquiry from ${fullName} (${payload.email})\n\nSubject: ${payload.subject}\n\nMessage:\n${payload.message}`,
    html: `
      <h2>New Contact Inquiry</h2>
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${payload.email}</p>
      <p><strong>Subject:</strong> ${payload.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${payload.message.replace(/\n/g, "<br />")}</p>
    `,
  });
}

export async function sendNewsletterSubscriptionEmail(payload: { email: string }) {
  if (!resend) throw new Error("RESEND_API_KEY is missing.");
  if (!newsletterGeneralSegmentId) {
    throw new Error(
      "Newsletter segment/audience ID is missing. Set RESEND_NEWSLETTER_SEGMENT_ID (or RESEND_GENERAL_SEGMENT_ID / RESEND_NEWSLETTER_AUDIENCE_ID / RESEND_GENERAL_AUDIENCE_ID).",
    );
  }

  const contactResult = await resend.contacts.create({
    email: payload.email,
    segments: [{ id: newsletterGeneralSegmentId }],
  });

  if (contactResult.error) {
    const message = contactResult.error.message || "Failed to create newsletter contact";
    const duplicate = contactResult.error.statusCode === 409 || /already exists|already subscribed/i.test(message);
    if (!duplicate) {
      throw new Error(message);
    }
  }

  if (!adminEmail) {
    return { success: true };
  }

  try {
    await sendEmail({
      to: adminEmail,
      subject: "New Newsletter Subscription",
      text: `A new newsletter signup was received: ${payload.email}`,
      html: `
        <h2>New Newsletter Subscription</h2>
        <p><strong>Email:</strong> ${payload.email}</p>
      `,
    });
  } catch (error) {
    console.error("Newsletter admin notification error:", error);
  }

  return { success: true };
}

export async function sendAdminOrderNotificationEmail(payload: AdminOrderNotificationPayload) {
  if (!adminEmail) throw new Error("ADMIN_NOTIFICATION_EMAIL is missing.");

  const subject = `New Order Received: ${payload.orderNumber}`;
  const itemsMarkup = payload.items
    .map((item) => {
      const variants = [item.size, item.color].filter(Boolean).join(" / ");
      return `<li>${item.name} x ${item.quantity}${variants ? ` (${variants})` : ""}</li>`;
    })
    .join("");

  return sendEmail({
    to: adminEmail,
    subject,
    text: [
      `Order: ${payload.orderNumber}`,
      `Status: ${payload.status}`,
      `Payment: ${payload.paymentMethod}`,
      `Total: ${formatCurrency(payload.totalPrice)}`,
      "",
      `Customer: ${payload.customer.name}`,
      `Email: ${payload.customer.email}`,
      `Phone: ${payload.customer.phone || "-"}`,
      `Address: ${payload.customer.address || "-"}`,
      "",
      "Items:",
      ...payload.items.map((item) => `- ${item.name} x ${item.quantity}`),
    ].join("\n"),
    html: `
      <h2>New Order Received</h2>
      <p><strong>Order:</strong> ${payload.orderNumber}</p>
      <p><strong>Status:</strong> ${normalizeStatus(payload.status)}</p>
      <p><strong>Payment:</strong> ${payload.paymentMethod}</p>
      <p><strong>Total:</strong> ${formatCurrency(payload.totalPrice)}</p>
      <hr />
      <p><strong>Customer:</strong> ${payload.customer.name}</p>
      <p><strong>Email:</strong> ${payload.customer.email}</p>
      <p><strong>Phone:</strong> ${payload.customer.phone || "-"}</p>
      <p><strong>Address:</strong> ${payload.customer.address || "-"}</p>
      <hr />
      <h3>Items</h3>
      <ul>${itemsMarkup}</ul>
      <p><a href="${appUrl}/dashboard/orders">Open Orders Dashboard</a></p>
    `,
  });
}

export async function sendCustomerOrderStatusEmail(payload: CustomerOrderStatusPayload) {
  const normalized = normalizeStatus(payload.status);
  const subject = `Order Update: ${payload.orderNumber} (${normalized})`;
  const greeting = toDisplayName(payload.name);
  const accountUrl = `${appUrl}/account`;
  const headline = getStatusHeadline(payload.status);
  const detailMessage = getStatusMessage(payload.status, payload.paymentMethod);

  return sendEmail({
    to: payload.email,
    subject,
    text: [
      `Hello ${greeting},`,
      "",
      headline,
      "",
      detailMessage,
      payload.paymentMethod ? `Payment method: ${payload.paymentMethod}` : "",
      "",
      "Order summary:",
      `- Order number: ${payload.orderNumber}`,
      `- Status: ${normalized}`,
      payload.totalPrice ? `- Amount: ${formatCurrency(payload.totalPrice)}` : "",
      payload.paymentMethod ? `- Payment method: ${payload.paymentMethod}` : "",
      "",
      `Track your order anytime: ${accountUrl}`,
      "",
      "Kind regards,",
      "Influence Fabrics",
    ]
      .filter(Boolean)
      .join("\n"),
    html: `
      <p>Hello ${greeting},</p>
      <p><strong>${headline}</strong></p>
      <p>${detailMessage}</p>
      <div style="margin:16px 0;padding:12px;border:1px solid #e5e7eb;background:#fafafa;">
        <p style="margin:0 0 8px;"><strong>Order Summary</strong></p>
        <p style="margin:0;">Order number: <strong>${payload.orderNumber}</strong></p>
        <p style="margin:0;">Status: <strong>${normalized}</strong></p>
        ${payload.totalPrice ? `<p style="margin:0;">Amount: <strong>${formatCurrency(payload.totalPrice)}</strong></p>` : ""}
        ${payload.paymentMethod ? `<p style="margin:0;">Payment method: <strong>${payload.paymentMethod}</strong></p>` : ""}
      </div>
      <p>Track your order anytime from your account:</p>
      <p><a href="${accountUrl}">${accountUrl}</a></p>
      <p>Kind regards,<br/>Influence Fabrics</p>
    `,
  });
}

export async function sendCustomerOrderReceivedEmail(payload: CustomerOrderReceivedPayload) {
  const greeting = toDisplayName(payload.name);
  const subject = `Order Received: ${payload.orderNumber}`;
  const accountUrl = `${appUrl}/account`;
  const paymentMethodLabel = payload.paymentMethod === "transfer" ? "Bank transfer" : "Paystack";

  return sendEmail({
    to: payload.email,
    subject,
    text: [
      `Hello ${greeting},`,
      "",
      "Thank you for your order. We have received it and our team will confirm it shortly.",
      payload.shippingToBeDeterminedAtPark
        ? "Shipping fee will be determined at the park and communicated to you during confirmation."
        : "",
      "",
      "Order summary:",
      `- Order number: ${payload.orderNumber}`,
      `- Payment method: ${paymentMethodLabel}`,
      `- Amount paid now: ${formatCurrency(payload.totalPrice)}`,
      "",
      `Track updates in your account: ${accountUrl}`,
      "",
      "Kind regards,",
      "Influence Fabrics",
    ]
      .filter(Boolean)
      .join("\n"),
    html: `
      <p>Hello ${greeting},</p>
      <p>Thank you for your order. We have received it and our team will confirm it shortly.</p>
      ${
        payload.shippingToBeDeterminedAtPark
          ? "<p><strong>Shipping fee will be determined at the park</strong> and communicated to you during confirmation.</p>"
          : ""
      }
      <div style="margin:16px 0;padding:12px;border:1px solid #e5e7eb;background:#fafafa;">
        <p style="margin:0 0 8px;"><strong>Order Summary</strong></p>
        <p style="margin:0;">Order number: <strong>${payload.orderNumber}</strong></p>
        <p style="margin:0;">Payment method: <strong>${paymentMethodLabel}</strong></p>
        <p style="margin:0;">Amount paid now: <strong>${formatCurrency(payload.totalPrice)}</strong></p>
      </div>
      <p>Track updates in your account:</p>
      <p><a href="${accountUrl}">${accountUrl}</a></p>
      <p>Kind regards,<br/>Influence Fabrics</p>
    `,
  });
}
