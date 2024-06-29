import { SignJWT } from "jose";
import nodemailer from "nodemailer";

const secretKey = process.env.SECRET_KEY;
const alogorith = "HS256";
const key = new TextEncoder().encode(secretKey);
export const auth_session_name = "auth_session_next14";

export async function resetPassword(email: string) {
  const resetPasswordToken = await new SignJWT({ email })
    .setProtectedHeader({ alg: alogorith })
    .setIssuedAt()
    .setExpirationTime("10 minutes from now")
    .sign(key);
  const resetPasswordLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/change?token=${resetPasswordToken}`;

  // Save the token and email to the database
  // This is a simplified example. In a real application, you should use a database.
  // Example:
  // await saveTokenToDatabase(email, activationToken);

  // Set up nodemailer transport
  const transporter = nodemailer.createTransport({
    service: "gmail", // Use your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Set up email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Change your password",
    html: resetPasswordHTMLContent(resetPasswordLink),
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("Error ", error);
  }
}

export async function sendActivationCode(email: string) {
  const activationToken = await new SignJWT({ email })
    .setProtectedHeader({ alg: alogorith })
    .setIssuedAt()
    .setExpirationTime("10 minutes from now")
    .sign(key);
  const activationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/activate-account?token=${activationToken}`;

  // Save the token and email to the database
  // This is a simplified example. In a real application, you should use a database.
  // Example:
  // await saveTokenToDatabase(email, activationToken);

  // Set up nodemailer transport
  const transporter = nodemailer.createTransport({
    service: "gmail", // Use your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Set up email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Activate Your Account",
    html: activateAccountHTMLContent(activationLink),
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("Error ", error);
  }
}

const resetPasswordHTMLContent = (link: string) => `<div> 
    <h4>Click the below button to change your password </h4>
    <div style="display:flex; justify-content:center; margin-top: 15px;" > 
    <a href="${link}" style=" text-decoration: none; width: 150px; height: 30px; border-radius: 10px; background-color: green; font-size: 14px; font-weight: bold; color: white; display: flex; justify-content: center; align-items: center; " >Open Link</a> 
    </div>
  </div>`;

  const activateAccountHTMLContent = (link: string) => `<div> 
    <h4>Click the below button to change your password </h4>
    <div style="display:flex; justify-content:center; margin-top: 15px;" > 
    <a href="${link}" style=" text-decoration: none; width: 150px; height: 30px; border-radius: 10px; background-color: green; font-size: 14px; font-weight: bold; color: white; display: flex; justify-content: center; align-items: center; " >Activate</a> 
    </div>
  </div>`;