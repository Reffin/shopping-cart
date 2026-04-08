const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// Trust proxy for Render/Railway
app.set("trust proxy", 1);

// ── Security Middleware ───────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json({ limit: "10kb" }));


const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", globalLimiter);

// ── Routes ───────────────────────────────────────────────────
app.use("/api/auth",     require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders",   require("./routes/orders"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/reviews",  require("./routes/reviews"));
app.use("/api/wishlist", require("./routes/wishlist"));

// ── Health check ─────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ── Test email route ──────────────────────────────────────────
app.post("/api/test-email", async (req, res) => {
  try {
    const BREVO_KEY = process.env.BREVO_API_KEY || "";
    console.log("BREVO KEY starts with:", BREVO_KEY.substring(0, 15));
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_KEY,
      },
      body: JSON.stringify({
        sender: { name: "ShopZone", email: "ryancarbonel1984@gmail.com" },
        to: [{ email: "ryancarbonel1984@gmail.com" }],
        subject: "Railway Test Email",
        htmlContent: "<h1>Railway email test!</h1>",
      }),
    });
    const data = await response.json();
    res.json({ status: response.status, data, keyStart: BREVO_KEY.substring(0, 15) });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// ── 404 handler ──────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: "Route not found" }));
