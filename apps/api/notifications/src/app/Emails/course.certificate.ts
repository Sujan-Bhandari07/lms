import { button, detailRow, detailsBox, esc, layout } from "./template.email";

export const COURSE_CERTIFICATE_EMAIL = (
  fullname: string,
  courseName: string,
  email: string,
) => ({
  from: process.env.SENDER_EMAIL,
  to: email,
  subject: `Congratulations! You Completed ${courseName}`,
  html: layout({
    preheader: `You've completed ${courseName}. Your certificate is ready!`,
    icon: "🎓",
    heading: `Congratulations, ${esc(fullname)}!`,
    body: `
      <p style="margin:0 0 16px;">
        You have successfully completed <strong>${esc(courseName)}</strong>. This is a real achievement, and we are proud of your dedication and hard work.
      </p>
      ${detailsBox(
        detailRow("Course", courseName) + detailRow("Status", "Completed ✔"),
      )}
      <p style="margin:0;">
        Your course certificate is now ready. Keep learning and growing!
      </p>
      ${button("View My Certificate")}
    `,
  }),
});