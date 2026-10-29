
export const BRAND = {
  name: "Ujyalo",
  tagline: "AI-Powered Learning",
  primary: "#4F46E5", // indigo
  primaryDark: "#3730A3",
  accent: "#06B6D4", // cyan
  text: "#1F2937",
  muted: "#6B7280",
  bg: "#F3F4F6",
  card: "#FFFFFF",
  border: "#E5E7EB",
};
 
// Prevents user-supplied values (names, course titles) from breaking the HTML.
export const esc = (value: string): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
 
export const button = (label: string, path = ""): string => {
  const base = process.env.APP_URL;
  if (!base) return "";
  const href = `${base.replace(/\/$/, "")}${path}`;
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 8px;">
      <tr>
        <td align="center" bgcolor="${BRAND.primary}" style="border-radius:8px;">
          <a href="${href}" target="_blank"
             style="display:inline-block;padding:14px 32px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:8px;">
            ${esc(label)}
          </a>
        </td>
      </tr>
    </table>`;
};
 
export const detailRow = (label: string, value: string): string => `
  <tr>
    <td style="padding:12px 16px;font-size:13px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.6px;border-bottom:1px solid ${BRAND.border};width:120px;">${esc(label)}</td>
    <td style="padding:12px 16px;font-size:15px;font-weight:600;color:${BRAND.text};border-bottom:1px solid ${BRAND.border};">${esc(value)}</td>
  </tr>`;
 
export const detailsBox = (rows: string): string => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="margin:24px 0;background:#F9FAFB;border:1px solid ${BRAND.border};border-radius:10px;border-collapse:separate;">
    ${rows}
  </table>`;
 
export const layout = (opts: {
  preheader: string;
  icon: string;
  heading: string;
  body: string;
}): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>${esc(opts.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};-webkit-text-size-adjust:100%;">
  <!-- Preheader (inbox preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${esc(opts.preheader)}
  </div>
 
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.bg}">
    <tr>
      <td align="center" style="padding:32px 12px;">
 
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
               style="width:100%;max-width:600px;background:${BRAND.card};border-radius:16px;overflow:hidden;border:1px solid ${BRAND.border};">
 
          <!-- Header -->
          <tr>
            <td align="center" bgcolor="${BRAND.primary}"
                style="padding:36px 24px;background:${BRAND.primary};background-image:linear-gradient(135deg,${BRAND.primary} 0%,${BRAND.accent} 100%);">
              <div style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:28px;font-weight:700;letter-spacing:1px;color:#FFFFFF;">
                ${BRAND.name}
              </div>
              <div style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#E0E7FF;margin-top:6px;">
                ${BRAND.tagline}
              </div>
            </td>
          </tr>
 
          <!-- Content -->
          <tr>
            <td style="padding:40px 40px 32px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:${BRAND.text};">
              <div style="font-size:44px;line-height:1;margin-bottom:16px;">${opts.icon}</div>
              <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;font-weight:700;color:${BRAND.text};">
                ${opts.heading}
              </h1>
              <div style="font-size:16px;line-height:1.7;color:#374151;">
                ${opts.body}
              </div>
              <p style="margin:32px 0 0;font-size:15px;line-height:1.6;color:#374151;">
                Warm regards,<br />
                <strong style="color:${BRAND.primary};">Team ${BRAND.name}</strong>
              </p>
            </td>
          </tr>
 
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background:#F9FAFB;border-top:1px solid ${BRAND.border};font-family:'Segoe UI',Helvetica,Arial,sans-serif;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:${BRAND.muted};">
                This is an automated message from ${BRAND.name}. Please do not reply to this email, as this mailbox is not monitored.
              </p>
              <p style="margin:0;font-size:12px;color:#9CA3AF;">
                &copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
              </p>
            </td>
          </tr>
 
        </table>
 
      </td>
    </tr>
  </table>
</body>
</html>`;