const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(cors({
  origin: "*", // OK for portfolio contact form
}));
app.use(express.json());

/* ---------- TEST ROUTE ---------- */
app.get("/", (req, res) => {
  res.send("Mail API is running ✅");
});

/* ---------- CONTACT ROUTE ---------- */
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password
      },
    });

    await transporter.verify(); // 🔥 catches auth errors early

    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`, // ✅ MUST be your email
      to: process.env.EMAIL_USER,
      replyTo: email, // user email here
      subject: `New Contact Message from ${name}`,
      html: `
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });

  } catch (error) {
    console.error("MAIL ERROR:", error.message);
    res.status(500).json({
      success: false,
      error: "Mail sending failed",
    });
  }
});

/* ---------- SERVER ---------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
