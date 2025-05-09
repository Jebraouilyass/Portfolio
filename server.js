const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config({ path: './.env' });

const app = express();
const port = process.env.PORT || 3000;

// Log environment variables for debugging
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);
console.log('RECEIVER_EMAIL:', process.env.RECEIVER_EMAIL);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(express.static('public')); // Serve static files (HTML, CSS, JS)

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify SMTP connection
transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP Connection Error:', error);
    } else {
        console.log('SMTP Server is ready to send emails');
    }
});

// Route to handle form submission
app.post('/send-email', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).send('Missing required fields');
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('Missing email credentials');
        return res.status(500).send('Server configuration error');
    }

    const mailOptions = {
        from: email,
        to: process.env.RECEIVER_EMAIL,
        subject: `New Contact Form Submission from ${name}`,
        text: `
            Name: ${name}
            Email: ${email}
            Message: ${message}
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Failed to send email');
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});