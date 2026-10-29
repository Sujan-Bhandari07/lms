import { button, detailRow, detailsBox, esc, layout } from "./template.email";

export const COURSE_ENROLLED_EMAIL = (
  fullname: string,
  courseName: string,
  email: string,
  tutorName: string,
) => ({
  from: process.env.SENDER_EMAIL,
  subject: `Enrollment Confirmed: ${courseName}`,
  to: email,
  html: layout({
    preheader: `You're now enrolled in ${courseName} with ${tutorName}.`,
    icon: "📚",
    heading: `You're enrolled, ${esc(fullname)}!`,
    body: `
      <p style="margin:0 0 16px;">
        Your enrollment has been confirmed. You now have full access to your new course.
      </p>
      ${detailsBox(
        detailRow("Course", courseName) + detailRow("Instructor", tutorName),
      )}
      <p style="margin:0;">
        Dive in whenever you're ready. Happy learning!
      </p>
      ${button("Start Learning")}
    `,
  }),
});