/**
 * ShopSmart transactional HTML emails — inline styles for client compatibility.
 * Palette matches client/app/globals.css (--color-charcoal, --color-teal, etc.).
 */

const COLOR_CHARCOAL = "#222222";
const COLOR_TEAL = "#00C2B2";
const COLOR_WHITE = "#FFFFFF";
const COLOR_MUTED_BG = "#F5F7FA";
const COLOR_MUTED_TEXT = "rgba(34, 34, 34, 0.65)";
const COLOR_BORDER = "rgba(34, 34, 34, 0.12)";
const COLOR_ERROR = "#b91c1c";
const RADIUS = "12px";
const RADIUS_SM = "8px";

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type ShellParams = {
  preheader: string;
  title: string;
  leadHtml: string;
  ctaLabel: string;
  ctaUrl: string;
  secondaryHtml?: string;
  footnoteHtml?: string;
};

function emailShell(params: ShellParams): string {
  const { preheader, title, leadHtml, ctaLabel, ctaUrl, secondaryHtml, footnoteHtml } = params;
  const safeUrl = escapeHtml(ctaUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${COLOR_MUTED_BG};font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${COLOR_MUTED_BG};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:${COLOR_WHITE};border-radius:${RADIUS};border:1px solid ${COLOR_BORDER};overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 8px 28px;text-align:left;">
              <p style="margin:0;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${COLOR_TEAL};">ShopSmart</p>
              <h1 style="margin:12px 0 0 0;font-size:22px;line-height:1.3;font-weight:700;color:${COLOR_CHARCOAL};">${escapeHtml(title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 24px 28px;">
              <div style="font-size:15px;line-height:1.6;color:${COLOR_CHARCOAL};">${leadHtml}</div>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0;">
                <tr>
                  <td style="border-radius:${RADIUS_SM};background:${COLOR_TEAL};">
                    <a href="${safeUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:${COLOR_WHITE};text-decoration:none;border-radius:${RADIUS_SM};">${escapeHtml(ctaLabel)}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px 0;font-size:13px;line-height:1.5;color:${COLOR_MUTED_TEXT};">If the button does not work, copy and paste this link into your browser:</p>
              <p style="margin:0;font-size:12px;word-break:break-all;color:${COLOR_TEAL};"><a href="${safeUrl}" style="color:${COLOR_TEAL};">${safeUrl}</a></p>
              ${secondaryHtml ?? ""}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px;border-top:1px solid ${COLOR_BORDER};background:${COLOR_MUTED_BG};">
              <p style="margin:0;font-size:12px;line-height:1.5;color:${COLOR_MUTED_TEXT};">
                ${footnoteHtml ?? `You received this email because of an action on your ShopSmart account.`}
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0 0;font-size:11px;color:${COLOR_MUTED_TEXT};text-align:center;">© ShopSmart · Smart shopping, trusted choices</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildVerificationEmail(params: {
  fullName?: string;
  verifyUrl: string;
}): { subject: string; html: string } {
  const name = params.fullName?.trim();
  const title = name ? `Welcome, ${name}` : "Welcome to ShopSmart";
  const subject = "Verify your email — ShopSmart";

  const lead = `
    <p style="margin:0 0 16px 0;">Thanks for signing up. Please confirm your email address so we can keep your account secure and send you order updates.</p>
    <p style="margin:0;color:${COLOR_MUTED_TEXT};font-size:14px;">This link expires in <strong style="color:${COLOR_CHARCOAL};">24 hours</strong>.</p>
  `;

  return {
    subject,
    html: emailShell({
      preheader: "Confirm your email to finish setting up your ShopSmart account.",
      title,
      leadHtml: lead,
      ctaLabel: "Verify email address",
      ctaUrl: params.verifyUrl,
      footnoteHtml: `If you did not create a ShopSmart account, you can safely ignore this message.`,
    }),
  };
}

export function buildPasswordResetEmail(params: { resetUrl: string }): { subject: string; html: string } {
  const subject = "Reset your password — ShopSmart";
  const lead = `
    <p style="margin:0 0 16px 0;">We received a request to reset the password for your ShopSmart account. Use the button below to choose a new password.</p>
    <p style="margin:0;color:${COLOR_MUTED_TEXT};font-size:14px;">This link expires in <strong style="color:${COLOR_CHARCOAL};">1 hour</strong>. If you did not request a reset, you can ignore this email — your password will stay the same.</p>
  `;

  return {
    subject,
    html: emailShell({
      preheader: "Reset your ShopSmart password using the secure link below.",
      title: "Reset your password",
      leadHtml: lead,
      ctaLabel: "Choose a new password",
      ctaUrl: params.resetUrl,
      secondaryHtml: `<p style="margin:24px 0 0 0;font-size:13px;color:${COLOR_ERROR};font-weight:500;">Didn’t request this? Ignore this email. Your account remains protected.</p>`,
      footnoteHtml: `For security, we never send your password by email. ShopSmart will only ask you to reset it from a link like the one above.`,
    }),
  };
}
