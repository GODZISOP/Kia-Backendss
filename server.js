import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();
const app = express();

app.use(cors({ origin: "https://kia-projectt.vercel.app" }));
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("🚀 Backend is running! You can now send requests to /api/contact");
});

// Contact Form API
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email and message required" });
    }

    // Send Email Notification
    if (process.env.MAIL_USER) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: "New Contact Form Message",
        html: `
          <h2>New Message Received</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || "N/A"}</p>
          <p><strong>Message:</strong><br>${message}</p>
        `
      });
    }

    res.json({
      success: true,
      message: "Message received — Thank you!"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Export for Vercel serverless
export default app;

// Local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}