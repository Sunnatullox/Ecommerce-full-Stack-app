const nodeMailer = require("nodemailer");
const ErrorHandler = require("../middleware/ErrorHandler");

const sendMail = async (option, next) => {
  const tranporent = nodeMailer.createTransport({
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    service: process.env.SMPT_SERVICE,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: option.email,
    subject: option.subject,
    text: option.message,
  };

  await tranporent.sendMail(mailOptions, (err) => {
    if (err) {
      console.log(err)
      return next(
        new ErrorHandler(
          "Sorry, your email could not be sent, please try again later",
          400
        )
      );
    }
  });
};

module.exports = sendMail;
