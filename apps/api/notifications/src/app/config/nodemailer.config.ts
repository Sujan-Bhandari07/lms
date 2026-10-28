
import nodemailer from "nodemailer";



const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_KEY, // Use App Password for Gmail
  },
  
});

export default transporter;
