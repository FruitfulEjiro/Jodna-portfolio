import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create Transporter
const transporter = nodemailer.createTransport({
   host: process.env.EMAIL_HOST,
   port: process.env.EMAIL_PORT,
   secure: true,
   auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
   },
});

// Send Email Function
const sendEmail = async (to, subject, text, html) => {
   try {
      const info = await transporter.sendMail({
         from: {
            name: "Jodna Portfolio",
            address: process.env.EMAIL_USER,
         },
         to,
         subject,
         text,
         html,
      });
      return info;
   } catch (error) {
      console.log(error);
   }
};

export default sendEmail;
