export const STUDENT_SIGNUP_EMAIL = (fullname: string,email:string) => ({
    to:email,
    from:process.env.SENDER_EMAIL,
  subject: "Welcome to Ujyalo!",
  html: `
    <h2>Welcome to Ujyalo, ${fullname}!</h2>
    <p>We're excited to have you join our learning community.</p>
    <p>Explore courses, learn new skills, and grow with AI-powered learning.</p>
    <p>Happy learning!</p>
    <strong>Team Ujyalo</strong>
  `,
});

export const TUTOR_SIGNUP_EMAIL = (fullname: string,email:string) => ({
    from:process.env.SENDER_EMAIL,
to:email,
  subject: "Welcome to Ujyalo — Tutor Registration",
  html: `
    <h2>Welcome, ${fullname}!</h2>
    <p>Thank you for joining Ujyalo as a tutor.</p>
    <p>Your tutor profile is awaiting verification.</p>
    <p>We'll notify you once your profile has been reviewed.</p>
    <strong>Team Ujyalo</strong>
  `,
});