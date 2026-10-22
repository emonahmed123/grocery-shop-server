import nodemailer from 'nodemailer';
import httpStatus from 'http-status';
import config from '../config';
import AppError from '../error/AppError';

// TODO: replace with your own transporter if it is not plain SMTP
const transporter = nodemailer.createTransport({
  host: config.smtp_host,
  port: Number(config.smtp_port) || 587,
  // port 465 uses SSL from the start, other ports upgrade with STARTTLS
  secure: Number(config.smtp_port) === 465,
  auth: {
    user: config.smtp_user,
    pass: config.smtp_pass,
  },
});

type TEmail = {
  to: string;
  subject: string;
  html: string;
};

const sendEmail = async ({ to, subject, html }: TEmail) => {
  try {
    await transporter.sendMail({
      from: config.email_from || config.smtp_user,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('Email sending failed:', err);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Could not send email, please try again later',
    );
  }
};

export default sendEmail;
