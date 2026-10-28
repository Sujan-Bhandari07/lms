export const COURSE_ENROLLED_EMAIL = (
  fullname: string,
  courseName: string,
  email:string,
  tutorName: string,

) => ({
    from:process.env.SENDER_EMAIL,
  subject: `Enrollment Confirmed: ${courseName}`,
  to:email,
  html: `
    <h2>You're enrolled, ${fullname}!</h2>
    <p>You have successfully enrolled in <strong>${courseName}</strong>.</p>
    <p>Instructor: ${tutorName}</p>

    <p>Happy learning!</p>
    <strong>Team Ujyalo</strong>
  `,
});