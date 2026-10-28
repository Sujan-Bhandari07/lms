export const TUTOR_VERIFIED_EMAIL = (fullname: string, email: string) => ({
  from: process.env.SENDER_EMAIL,
  to: email,
  subject: "Congratulations! Your Tutor Profile Is Verified",
  html: `
    <h2>Congratulations, ${fullname}!</h2>
    <p>Your tutor profile has been successfully verified.</p>
    <p>You can now access the tutor features available to your account.</p>
    <strong>Team Ujyalo</strong>
  `,
});
