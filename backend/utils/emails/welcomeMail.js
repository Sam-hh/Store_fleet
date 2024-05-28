// Import the necessary modules here
import fs from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";
export const sendWelcomeEmail = async (user) => {
  // Write your code here
  const file = await fs.readFile(
    path.resolve("utils", "emails", "htmlMail.html"),
    "utf-8"
  );
  console.log(user.email);
  console.log(file);
  console.log(process.env.STORFLEET_SMPT_MAIL_PASSWORD);
  const mailOptions = {
    from: process.env.STORFLEET_SMPT_MAIL,
    to: user.email,
    subject: "Welcome to storefleet",
    html: file,
    attachments: [
      {
        filename: "logo.png",
        path: path.resolve("utils", "emails", "logo.png"),
        cid: "logo", 
      },
    ],
  };
  const transporter = nodemailer.createTransport({
    service: process.env.SMPT_SERVICE,
    auth: {
      user: process.env.STORFLEET_SMPT_MAIL,
      pass: process.env.STORFLEET_SMPT_MAIL_PASSWORD,
    },
  });
  const result = await transporter.sendMail(mailOptions);
  console.log("resultmail", result);
};
