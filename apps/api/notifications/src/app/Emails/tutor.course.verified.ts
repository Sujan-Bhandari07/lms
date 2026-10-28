
export const TUTOR_COURSE_VERIFIED_EMAIL = (
  fullname: string,
  courseName: string,
  email:string
  

) => ({
    from:process.env.SENDER_EMAIL,
to:email,
  subject: `Your Course Has Been Approved: ${courseName}`,
  html: `
    <h2>Great news, ${fullname}!</h2>
    <p>Your course <strong>${courseName}</strong> has been reviewed and approved.</p>
    <p>Your course is ready for the next step in the publishing process.</p>
   <p> Now you can upload and manage your course.</P>
    <strong>Team Ujyalo</strong>
  `,
});