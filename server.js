// server.js - simple Express backend for contact form

const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();

// handle form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// serve static files (html/css/images) from project root
app.use(express.static(path.join(__dirname)));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// transport configuration - adjust to your SMTP provider
// It's highly recommended to keep credentials in environment variables.
// For local development, this will fall back to an Ethereal test account (no real email sent).
async function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    const testAccount = await nodemailer.createTestAccount();
    console.log('No SMTP credentials detected; using Ethereal test account.');
    console.log('Preview URL will be logged after sending a message.');

    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  throw new Error('Missing SMTP credentials (SMTP_USER/SMTP_PASS) in production');
}

const transporterPromise = createTransporter();

// simple validation helper
function clean(s) {
  return String(s || '').trim();
}

app.post('/contact', async (req, res) => {
  try {
    const data = {
      name: clean(req.body.name),
      email: clean(req.body.email),
      phone: clean(req.body.phone),
      event: clean(req.body['event-type']),
      date: clean(req.body.date),
      guests: clean(req.body.guests),
      venue: clean(req.body.venue),
      message: clean(req.body.message),
      consent: req.body.terms ? 'Yes' : 'No',
    };

    const errors = [];
    if (!data.name) errors.push('Name is required');
    if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) errors.push('Valid email required');
    if (!data.message) errors.push('Message is required');
    if (data.consent !== 'Yes') errors.push('Consent is required');

    if (errors.length) {
      // return to client with errors (JSON for fetch or simple redirect)
      return res.status(400).send(errors.join('<br>'));
    }

    const mailOptions = {
      from: "Hotel Contact <anizmohdali@gmail.com>",
      replyTo: data.email,
      to: process.env.TO_ADDRESS || 'anizmohdali@gmail.com',
      subject: 'New inquiry from contact form',
      text: `Name: ${data.name}\n` +
            `Email: ${data.email}\n` +
            `Phone: ${data.phone}\n` +
            `Event Type: ${data.event}\n` +
            `Date: ${data.date}\n` +
            `Guests: ${data.guests}\n` +
            `Venue: ${data.venue}\n` +
            `Consent: ${data.consent}\n\n` +
            `Message:\n${data.message}\n`,
    };

    const transporter = await transporterPromise;
    const info = await transporter.sendMail(mailOptions);

    // if using Ethereal (dev-only), log a preview URL for debugging
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log('Ethereal preview URL:', previewUrl);

    // on success, redirect back to form with query param
    return res.redirect('/contact.html?sent=1');
  } catch (err) {
    console.error('Mail error', err);
    return res.status(500).send('Sorry, there was a problem sending your message.');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0',() => {
  console.log(`Server listening on http://localhost:${port}`);
});
