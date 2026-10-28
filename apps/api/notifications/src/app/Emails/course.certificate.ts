export const COURSE_CERTIFICATE_EMAIL = (
  fullname: string,
  courseName: string,
  email:string
  

) => ({
    from:process.env.SENDER_EMAIL,
to:email,
  subject: `Congratulations! You Completed ${courseName}`,
  html: `
    <h2>Congratulations, ${fullname}!</h2>
    <p>You have successfully completed <strong>${courseName}</strong>.</p>
    <p>Your course certificate is ready.</p>
  
    <p>Keep learning and growing!</p>
    <strong>Team Ujyalo</strong>
  `,
});