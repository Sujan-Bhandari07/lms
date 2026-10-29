import { button, detailRow, detailsBox, esc, layout } from "./template.email";

export const TUTOR_VERIFIED_EMAIL = (fullname: string, email: string) => ({
  from: process.env.SENDER_EMAIL,
  to: email,
  subject: "Congratulations! Your Tutor Profile Is Verified",
  html: layout({
    preheader: "Your tutor profile is verified. You're ready to go!",
    icon: "🎉",
    heading: `Congratulations, ${esc(fullname)}!`,
    body: `
      <p style="margin:0 0 16px;">
        Your tutor profile has been successfully verified.
      </p>
      ${detailsBox(detailRow("Profile status", "Verified ✔"))}
      <p style="margin:0;">
        You can now access all the tutor features available to your account.
      </p>
      ${button("Go to Tutor Dashboard")}
    `,
  }),
});
 