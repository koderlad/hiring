const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  //1. Create a Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //2. Define the email options
  const mailOptions = {
    from: "Kamlesh Shrestha <koderlad@gmail.com>",
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  //3. Actually send the email with NodeMailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
