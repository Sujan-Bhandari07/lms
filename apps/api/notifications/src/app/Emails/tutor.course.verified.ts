import { button, detailRow, detailsBox, esc, layout } from "./template.email";

export const TUTOR_COURSE_VERIFIED_EMAIL = (
  fullname: string,
  courseName: string,
  email: string,
) => ({
  from: process.env.SENDER_EMAIL,
  to: email,
  subject: `Your Course Has Been Approved: ${courseName}`,
  html: layout({
    preheader: `${courseName} has been reviewed and approved.`,
    icon: "✅",
    heading: `Great news, ${esc(fullname)}!`,
    body: `
      <p style="margin:0 0 16px;">
        Your course has been reviewed and approved by our team.
      </p>
      ${detailsBox(
        detailRow("Course", courseName) + detailRow("Status", "Approved ✔"),
      )}
      <p style="margin:0;">
        Your course is ready for the next step in the publishing process. You can now upload and manage your course content.
      </p>
      ${button("Manage My Course")}
    `,
  }),
});
 