import { BRAND, button, detailRow, detailsBox, esc, layout } from "./template.email";

export const STUDENT_SIGNUP_EMAIL = (fullname: string, email: string) => ({
  to: email,
  from: process.env.SENDER_EMAIL,
  subject: "Welcome to Ujyalo!",
  html: layout({
    preheader: "Your learning journey with Ujyalo starts now.",
    icon: "👋",
    heading: `Welcome to Ujyalo, ${esc(fullname)}!`,
    body: `
      <p style="margin:0 0 16px;">
        We're excited to have you join our learning community. Your account is ready, and your learning journey starts now.
      </p>
      <p style="margin:0 0 8px;font-weight:600;color:${BRAND.text};">Here's what you can do:</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;">
        <tr><td style="padding:6px 0;font-size:15px;color:#374151;">🔍&nbsp;&nbsp;Explore courses taught by expert tutors</td></tr>
        <tr><td style="padding:6px 0;font-size:15px;color:#374151;">🤖&nbsp;&nbsp;Learn smarter with AI-powered assistance</td></tr>
        <tr><td style="padding:6px 0;font-size:15px;color:#374151;">🏆&nbsp;&nbsp;Earn certificates as you complete courses</td></tr>
      </table>
      <p style="margin:0;">Happy learning!</p>
      ${button("Explore Courses")}
    `,
  }),
});
 
export const TUTOR_SIGNUP_EMAIL = (fullname: string, email: string) => ({
  from: process.env.SENDER_EMAIL,
  to: email,
  subject: "Welcome to Ujyalo — Tutor Registration",
  html: layout({
    preheader: "Thanks for registering as a tutor. Your profile is under review.",
    icon: "🧑‍🏫",
    heading: `Welcome, ${esc(fullname)}!`,
    body: `
      <p style="margin:0 0 16px;">
        Thank you for joining Ujyalo as a tutor. We're delighted to have you share your knowledge with our learners.
      </p>
      ${detailsBox(detailRow("Profile status", "Awaiting verification ⏳"))}
      <p style="margin:0;">
        Our team is reviewing your tutor profile. We'll notify you by email as soon as the review is complete.
      </p>
    `,
  }),
});