import "server-only";

import { Resend } from "resend";

type OrderEmailItem = {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  image?: string;
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
  items?: OrderEmailItem[];
};

type CustomerOrderReceivedPayload = {
  orderNumber: string;
  email: string;
  name?: string;
  paymentMethod: "transfer" | "paystack";
  totalPrice: number;
  shippingToBeDeterminedAtPark?: boolean;
  items?: OrderEmailItem[];
  customer?: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
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

// ─── Brand Constants ────────────────────────────────────────────────────────
const BRAND = {
  name: "Influence Fabrics",
  tagline: "Bringing african culture & modern beauty to your doorstep",
  primaryColor: "#D97706",    // warm amber/orange to match the logo
  darkColor: "#1a1a1a",
  lightBg: "#faf9f7",
  borderColor: "#e8e4df",
  mutedText: "#8a8580",
  website: "theinfluencefabrics.com",
};

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

function getStatusEmoji(status: string) {
  if (status === "approved") return "✅";
  if (status === "shipped") return "🚚";
  if (status === "delivered") return "📦";
  if (status === "cancelled") return "❌";
  return "📋";
}

function formatDate(date?: Date) {
  const d = date || new Date();
  return d.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ─── Branded Layout ─────────────────────────────────────────────────────────

function brandedEmailLayout(bodyContent: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${BRAND.name}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0eeeb;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0eeeb;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background-color:${BRAND.primaryColor};padding:28px 40px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <h1 style="margin:0;font-size:22px;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:#ffffff;">
                      ${BRAND.name}
                    </h1>
                    <p style="margin:6px 0 0;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.5);">
                      <a href="https://${BRAND.website}" style="color:rgba(255,255,255,0.5);text-decoration:none;">${BRAND.website}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:0;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${BRAND.lightBg};padding:28px 40px;border-top:1px solid ${BRAND.borderColor};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 8px;font-size:11px;color:${BRAND.mutedText};letter-spacing:1px;text-transform:uppercase;">
                      Thanks for shopping with us
                    </p>
                    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:${BRAND.darkColor};">
                      ${BRAND.name}
                    </p>
                    <p style="margin:0 0 16px;font-size:11px;color:${BRAND.mutedText};">
                      ${BRAND.tagline}
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:0 8px;">
                          <a href="https://${BRAND.website}" style="font-size:11px;color:${BRAND.primaryColor};text-decoration:none;letter-spacing:0.5px;">Visit Website</a>
                        </td>
                        <td style="color:${BRAND.borderColor};font-size:11px;">|</td>
                        <td style="padding:0 8px;">
                          <a href="https://${BRAND.website}/collection" style="font-size:11px;color:${BRAND.primaryColor};text-decoration:none;letter-spacing:0.5px;">Shop Collection</a>
                        </td>
                        <td style="color:${BRAND.borderColor};font-size:11px;">|</td>
                        <td style="padding:0 8px;">
                          <a href="https://${BRAND.website}/contact" style="font-size:11px;color:${BRAND.primaryColor};text-decoration:none;letter-spacing:0.5px;">Contact Us</a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:20px 0 0;font-size:10px;color:${BRAND.mutedText};letter-spacing:0.5px;">
                      &copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Item Row Builder (with image) ──────────────────────────────────────────

function buildItemRows(items: OrderEmailItem[]): string {
  return items
    .map((item) => {
      const variants = [item.size, item.color].filter(Boolean).join(" / ");
      const imageCell = item.image
        ? `<td style="padding:12px 16px 12px 0;vertical-align:top;width:70px;">
            <img src="${item.image}" alt="${item.name}" width="60" height="60" style="display:block;border-radius:4px;object-fit:cover;border:1px solid ${BRAND.borderColor};" />
          </td>`
        : `<td style="padding:12px 16px 12px 0;vertical-align:top;width:70px;">
            <div style="width:60px;height:60px;background:${BRAND.lightBg};border-radius:4px;border:1px solid ${BRAND.borderColor};"></div>
          </td>`;

      return `
        <tr>
          ${imageCell}
          <td style="padding:12px 0;vertical-align:top;">
            <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:${BRAND.darkColor};">${item.name}</p>
            ${variants ? `<p style="margin:0 0 2px;font-size:11px;color:${BRAND.mutedText};text-transform:uppercase;letter-spacing:0.5px;">${variants}</p>` : ""}
            <p style="margin:0;font-size:12px;color:${BRAND.mutedText};">Qty: ${item.quantity}</p>
          </td>
          <td style="padding:12px 0;vertical-align:top;text-align:right;">
            <p style="margin:0;font-size:14px;font-weight:700;color:${BRAND.darkColor};">${formatCurrency(item.price * item.quantity)}</p>
            ${item.quantity > 1 ? `<p style="margin:2px 0 0;font-size:11px;color:${BRAND.mutedText};">${formatCurrency(item.price)} each</p>` : ""}
          </td>
        </tr>`;
    })
    .join(`<tr><td colspan="3" style="border-bottom:1px solid ${BRAND.borderColor};"></td></tr>`);
}

// ─── CTA Button ─────────────────────────────────────────────────────────────

function ctaButton(label: string, url: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr>
        <td style="background-color:${BRAND.primaryColor};border-radius:4px;padding:14px 32px;">
          <a href="${url}" style="color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;display:inline-block;">${label}</a>
        </td>
      </tr>
    </table>`;
}

// ─── Send Email ─────────────────────────────────────────────────────────────

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

// ═══════════════════════════════════════════════════════════════════════════
//  PUBLIC EMAIL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

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
    html: brandedEmailLayout(`
      <div style="padding:32px 40px;">
        <h2 style="margin:0 0 8px;font-size:20px;font-weight:800;color:${BRAND.darkColor};">New Contact Inquiry</h2>
        <p style="margin:0 0 20px;font-size:13px;color:${BRAND.mutedText};">A customer has reached out via the contact form.</p>
        
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.lightBg};border:1px solid ${BRAND.borderColor};border-radius:4px;padding:20px;">
          <tr><td style="padding:8px 16px;"><strong style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${BRAND.mutedText};">Name</strong><br/><span style="font-size:14px;color:${BRAND.darkColor};">${fullName}</span></td></tr>
          <tr><td style="padding:8px 16px;border-top:1px solid ${BRAND.borderColor};"><strong style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${BRAND.mutedText};">Email</strong><br/><a href="mailto:${payload.email}" style="font-size:14px;color:${BRAND.primaryColor};">${payload.email}</a></td></tr>
          <tr><td style="padding:8px 16px;border-top:1px solid ${BRAND.borderColor};"><strong style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${BRAND.mutedText};">Subject</strong><br/><span style="font-size:14px;color:${BRAND.darkColor};">${payload.subject}</span></td></tr>
          <tr><td style="padding:8px 16px;border-top:1px solid ${BRAND.borderColor};"><strong style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${BRAND.mutedText};">Message</strong><br/><span style="font-size:14px;color:${BRAND.darkColor};line-height:1.6;">${payload.message.replace(/\n/g, "<br />")}</span></td></tr>
        </table>
      </div>
    `),
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
      html: brandedEmailLayout(`
        <div style="padding:32px 40px;text-align:center;">
          <p style="margin:0 0 4px;font-size:28px;">📫</p>
          <h2 style="margin:0 0 8px;font-size:18px;font-weight:800;color:${BRAND.darkColor};">New Newsletter Subscriber</h2>
          <p style="margin:0;font-size:14px;color:${BRAND.mutedText};">${payload.email}</p>
        </div>
      `),
    });
  } catch (error) {
    console.error("Newsletter admin notification error:", error);
  }

  return { success: true };
}

// ─── Admin: New Order ───────────────────────────────────────────────────────

export async function sendAdminOrderNotificationEmail(payload: AdminOrderNotificationPayload) {
  if (!adminEmail) throw new Error("ADMIN_NOTIFICATION_EMAIL is missing.");

  const subject = `🛒 New Order: ${payload.orderNumber}`;
  const paymentLabel = payload.paymentMethod === "transfer" ? "Bank Transfer" : "Paystack";
  const statusLabel = normalizeStatus(payload.status);

  const itemsHtml = payload.items.length > 0 ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
      ${buildItemRows(payload.items)}
    </table>` : "";

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
    html: brandedEmailLayout(`
      <!-- Alert Banner -->
      <div style="background:${BRAND.primaryColor};padding:12px 40px;">
        <p style="margin:0;font-size:11px;font-weight:700;color:#ffffff;letter-spacing:1.5px;text-transform:uppercase;text-align:center;">
          New ${paymentLabel} Order Received
        </p>
      </div>

      <div style="padding:32px 40px;">
        <!-- Order + Status -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            <td>
              <h2 style="margin:0 0 4px;font-size:22px;font-weight:800;color:${BRAND.darkColor};">Order ${payload.orderNumber}</h2>
              <p style="margin:0;font-size:12px;color:${BRAND.mutedText};">Date: ${formatDate()}</p>
            </td>
            <td align="right" style="vertical-align:top;">
              <span style="display:inline-block;padding:6px 14px;background:${payload.status === 'approved' ? '#dcfce7' : '#fef9c3'};color:${payload.status === 'approved' ? '#166534' : '#854d0e'};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;border-radius:20px;">
                ${statusLabel}
              </span>
            </td>
          </tr>
        </table>

        <!-- Customer Details -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.lightBg};border:1px solid ${BRAND.borderColor};border-radius:4px;margin-bottom:24px;">
          <tr>
            <td style="padding:16px 20px;width:50%;vertical-align:top;border-right:1px solid ${BRAND.borderColor};">
              <p style="margin:0 0 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${BRAND.mutedText};">Customer</p>
              <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:${BRAND.darkColor};">${payload.customer.name}</p>
              <p style="margin:0 0 2px;font-size:13px;color:${BRAND.mutedText};">${payload.customer.email}</p>
              <p style="margin:0;font-size:13px;color:${BRAND.mutedText};">${payload.customer.phone || "—"}</p>
            </td>
            <td style="padding:16px 20px;width:50%;vertical-align:top;">
              <p style="margin:0 0 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${BRAND.mutedText};">Details</p>
              <p style="margin:0 0 4px;font-size:13px;color:${BRAND.darkColor};"><strong>Payment:</strong> ${paymentLabel}</p>
              <p style="margin:0 0 4px;font-size:13px;color:${BRAND.darkColor};"><strong>Total:</strong> ${formatCurrency(payload.totalPrice)}</p>
              <p style="margin:0;font-size:13px;color:${BRAND.darkColor};"><strong>Address:</strong> ${payload.customer.address || "—"}</p>
            </td>
          </tr>
        </table>

        <!-- Items -->
        <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:${BRAND.darkColor};text-transform:uppercase;letter-spacing:1px;">Order Items</p>
        ${itemsHtml}

        <!-- Total -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-top:2px solid ${BRAND.darkColor};padding-top:16px;">
          <tr>
            <td><p style="margin:0;font-size:16px;font-weight:800;color:${BRAND.darkColor};">Total</p></td>
            <td align="right"><p style="margin:0;font-size:18px;font-weight:800;color:${BRAND.darkColor};">${formatCurrency(payload.totalPrice)}</p></td>
          </tr>
        </table>

        <!-- CTA -->
        <div style="margin-top:28px;text-align:center;">
          ${ctaButton("Open Orders Dashboard", `${appUrl}/dashboard/orders`)}
        </div>
      </div>
    `),
  });
}

// ─── Customer: Order Status Update ──────────────────────────────────────────

export async function sendCustomerOrderStatusEmail(payload: CustomerOrderStatusPayload) {
  const normalized = normalizeStatus(payload.status);
  const subject = `${getStatusEmoji(payload.status)} Order Update: ${payload.orderNumber}`;
  const greeting = toDisplayName(payload.name);
  const headline = getStatusHeadline(payload.status);
  const detailMessage = getStatusMessage(payload.status, payload.paymentMethod);
  const paymentLabel = payload.paymentMethod === "transfer" ? "Bank Transfer" : payload.paymentMethod === "paystack" ? "Paystack" : payload.paymentMethod;

  const statusColor = payload.status === "approved" ? "#166534"
    : payload.status === "shipped" ? "#1e40af"
    : payload.status === "delivered" ? "#166534"
    : "#854d0e";

  const statusBg = payload.status === "approved" ? "#dcfce7"
    : payload.status === "shipped" ? "#dbeafe"
    : payload.status === "delivered" ? "#dcfce7"
    : "#fef9c3";

  const itemsSection = payload.items && payload.items.length > 0 ? `
    <!-- Order Items -->
    <div style="margin-top:24px;">
      <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:${BRAND.darkColor};text-transform:uppercase;letter-spacing:1px;">Order Summary</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${buildItemRows(payload.items)}
      </table>
    </div>
  ` : "";

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
      `Track your order anytime: ${appUrl}/account`,
      "",
      "Kind regards,",
      BRAND.name,
    ]
      .filter(Boolean)
      .join("\n"),
    html: brandedEmailLayout(`
      <div style="padding:32px 40px;">
        <!-- Greeting -->
        <p style="margin:0 0 4px;font-size:14px;color:${BRAND.mutedText};">Hello ${greeting},</p>
        <h2 style="margin:0 0 16px;font-size:22px;font-weight:800;color:${BRAND.darkColor};">${headline}</h2>
        <p style="margin:0 0 24px;font-size:14px;color:#444;line-height:1.6;">${detailMessage}</p>

        <!-- Order Info Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.lightBg};border:1px solid ${BRAND.borderColor};border-radius:4px;margin-bottom:24px;">
          <tr>
            <td style="padding:20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${BRAND.mutedText};">Order No</p>
                    <p style="margin:0;font-size:16px;font-weight:700;color:${BRAND.darkColor};">${payload.orderNumber}</p>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <span style="display:inline-block;padding:6px 14px;background:${statusBg};color:${statusColor};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;border-radius:20px;">
                      ${normalized}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top:12px;">
                    ${payload.totalPrice ? `<p style="margin:0 0 4px;font-size:13px;color:${BRAND.darkColor};"><strong>Amount:</strong> ${formatCurrency(payload.totalPrice)}</p>` : ""}
                    ${paymentLabel ? `<p style="margin:0;font-size:13px;color:${BRAND.darkColor};"><strong>Payment:</strong> ${paymentLabel}</p>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        ${itemsSection}

        <!-- CTA -->
        <div style="margin-top:28px;text-align:center;">
          ${ctaButton("View Order Status", `${appUrl}/account`)}
        </div>

        <p style="margin:28px 0 0;font-size:13px;color:${BRAND.mutedText};line-height:1.6;">
          If you have any questions about your order, please don't hesitate to <a href="https://${BRAND.website}/contact" style="color:${BRAND.primaryColor};text-decoration:none;font-weight:600;">contact us</a>.
        </p>
      </div>
    `),
  });
}

// ─── Customer: Order Received ───────────────────────────────────────────────

export async function sendCustomerOrderReceivedEmail(payload: CustomerOrderReceivedPayload) {
  const greeting = toDisplayName(payload.name);
  const subject = `✨ Order Confirmed: ${payload.orderNumber}`;
  const paymentMethodLabel = payload.paymentMethod === "transfer" ? "Bank Transfer" : "Paystack";
  const orderDate = formatDate();

  const itemsSection = payload.items && payload.items.length > 0 ? `
    <!-- Order Summary Header -->
    <div style="padding:20px 40px 0;">
      <p style="margin:0;font-size:14px;font-weight:700;color:${BRAND.darkColor};text-transform:uppercase;letter-spacing:1px;">Order Summary</p>
    </div>
    <div style="padding:12px 40px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${buildItemRows(payload.items)}
      </table>

      <!-- Totals -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-top:2px solid ${BRAND.darkColor};padding-top:16px;">
        <tr>
          <td><p style="margin:0;font-size:13px;color:${BRAND.mutedText};">Subtotal</p></td>
          <td align="right"><p style="margin:0;font-size:13px;color:${BRAND.darkColor};">${formatCurrency(payload.totalPrice)}</p></td>
        </tr>
        <tr>
          <td><p style="margin:4px 0 0;font-size:13px;color:${BRAND.mutedText};">Shipping</p></td>
          <td align="right"><p style="margin:4px 0 0;font-size:13px;color:${BRAND.darkColor};">${payload.shippingToBeDeterminedAtPark ? "To Be Determined" : "Included"}</p></td>
        </tr>
        <tr>
          <td style="padding-top:12px;border-top:1px solid ${BRAND.borderColor};"><p style="margin:0;font-size:16px;font-weight:800;color:${BRAND.darkColor};">Total</p></td>
          <td align="right" style="padding-top:12px;border-top:1px solid ${BRAND.borderColor};"><p style="margin:0;font-size:18px;font-weight:800;color:${BRAND.darkColor};">${formatCurrency(payload.totalPrice)}</p></td>
        </tr>
      </table>
    </div>
  ` : `
    <div style="padding:12px 40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid ${BRAND.darkColor};padding-top:16px;">
        <tr>
          <td><p style="margin:0;font-size:16px;font-weight:800;color:${BRAND.darkColor};">Total</p></td>
          <td align="right"><p style="margin:0;font-size:18px;font-weight:800;color:${BRAND.darkColor};">${formatCurrency(payload.totalPrice)}</p></td>
        </tr>
      </table>
    </div>
  `;

  const deliverySection = payload.customer ? `
    <!-- Delivery Details -->
    <div style="padding:0 40px 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.lightBg};border:1px solid ${BRAND.borderColor};border-radius:4px;">
        <tr>
          <td style="padding:16px 20px;width:50%;vertical-align:top;border-right:1px solid ${BRAND.borderColor};">
            <p style="margin:0 0 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${BRAND.mutedText};">Payment Method</p>
            <p style="margin:0;font-size:13px;font-weight:600;color:${BRAND.darkColor};">${paymentMethodLabel}</p>
          </td>
          <td style="padding:16px 20px;width:50%;vertical-align:top;">
            <p style="margin:0 0 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${BRAND.mutedText};">Delivery Address</p>
            <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:${BRAND.darkColor};">${payload.customer.name}</p>
            ${payload.customer.phone ? `<p style="margin:0 0 2px;font-size:12px;color:${BRAND.mutedText};">${payload.customer.phone}</p>` : ""}
            <p style="margin:0;font-size:12px;color:${BRAND.mutedText};line-height:1.5;">${payload.customer.address || "To be confirmed"}</p>
          </td>
        </tr>
      </table>
    </div>
  ` : "";

  return sendEmail({
    to: payload.email,
    subject,
    text: [
      `Hello ${greeting},`,
      "",
      "Thank you for your purchase!",
      "",
      "Thank you for shopping with us! We are pleased to confirm that your order has been received and is currently being processed.",
      payload.shippingToBeDeterminedAtPark
        ? "Shipping fee will be determined at the park and communicated to you during confirmation."
        : "",
      "",
      "Order summary:",
      `- Order number: ${payload.orderNumber}`,
      `- Date: ${orderDate}`,
      `- Payment method: ${paymentMethodLabel}`,
      `- Amount: ${formatCurrency(payload.totalPrice)}`,
      ...(payload.items || []).map((item) => `- ${item.name} x ${item.quantity} — ${formatCurrency(item.price * item.quantity)}`),
      "",
      `Track updates in your account: ${appUrl}/account`,
      "",
      "Your payment has been processed and we will begin preparing your order for shipment. Thank you for choosing us! We appreciate your business and hope you enjoy your purchase.",
      "",
      "Kind regards,",
      BRAND.name,
    ]
      .filter(Boolean)
      .join("\n"),
    html: brandedEmailLayout(`
      <div style="padding:32px 40px 24px;">
        <!-- Greeting -->
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${BRAND.darkColor};">Thank you for your purchase</h2>
        <p style="margin:0 0 4px;font-size:14px;color:#444;line-height:1.6;">Hello ${greeting},</p>
        <p style="margin:0 0 24px;font-size:14px;color:#444;line-height:1.6;">
          Thank you for shopping with us! We are pleased to confirm that your order has been received and is currently being processed.
        </p>

        <!-- Order Number + CTA -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            <td style="vertical-align:middle;">
              <p style="margin:0;font-size:16px;font-weight:800;color:${BRAND.darkColor};">Order No: ${payload.orderNumber}</p>
              <p style="margin:4px 0 0;font-size:12px;color:${BRAND.mutedText};">Date: ${orderDate}</p>
            </td>
            <td align="right" style="vertical-align:middle;">
              ${ctaButton("View Order", `${appUrl}/account`)}
            </td>
          </tr>
        </table>
      </div>

      ${deliverySection}
      ${itemsSection}

      ${payload.shippingToBeDeterminedAtPark ? `
        <div style="padding:16px 40px;">
          <div style="background:#fef9c3;border:1px solid #fde68a;border-radius:4px;padding:12px 16px;">
            <p style="margin:0;font-size:12px;color:#854d0e;line-height:1.5;">
              <strong>Note:</strong> Shipping fee for your region will be determined at the park and communicated to you during order confirmation.
            </p>
          </div>
        </div>
      ` : ""}

      <div style="padding:24px 40px 32px;">
        <p style="margin:0 0 16px;font-size:14px;color:#444;line-height:1.6;">
          Your payment has been processed and we will begin preparing your order for shipment. Thank you for choosing us! We appreciate your business and hope you enjoy your purchase.
        </p>

        <p style="margin:0 0 20px;font-size:13px;color:${BRAND.mutedText};line-height:1.6;">
          <strong style="color:${BRAND.darkColor};">Quick Tips:</strong> Next time you shop, <a href="${appUrl}/auth/login" style="color:${BRAND.primaryColor};text-decoration:none;font-weight:600;">log in</a> before checkout to use any of your saved delivery details and skip re-entering your information. You can also view your <a href="${appUrl}/account" style="color:${BRAND.primaryColor};text-decoration:none;font-weight:600;">order history</a> and reorder this or any of your favourite orders anytime.
        </p>
      </div>
    `),
  });
}
