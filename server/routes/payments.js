const router = require("express").Router();
const axios = require("axios");
const { verifyToken } = require("../middleware/auth");

const PAYMONGO_URL = "https://api.paymongo.com/v1";
const PAYMONGO_SECRET = Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString("base64");

const paymongoHeaders = {
  "Content-Type": "application/json",
  "Authorization": `Basic ${PAYMONGO_SECRET}`,
};

// ── POST /api/payments/create-link ────────────────────────────
// Create a PayMongo payment link
router.post("/create-link", verifyToken, async (req, res) => {
  try {
    const { amount, description, orderId } = req.body;

    if (!amount || !description) {
      return res.status(400).json({ error: "Amount and description are required" });
    }

    const response = await axios.post(
      `${PAYMONGO_URL}/links`,
      {
        data: {
          attributes: {
            amount: amount * 100, // PayMongo uses centavos
            description,
            remarks: `Order #${orderId}`,
          },
        },
      },
      { headers: paymongoHeaders }
    );

    res.json({
      checkoutUrl: response.data.data.attributes.checkout_url,
      linkId: response.data.data.id,
    });
  } catch (err) {
    console.error("PayMongo error:", err.response?.data || err.message);
    res.status(500).json({ error: "Payment creation failed" });
  }
});

// ── GET /api/payments/status/:linkId ─────────────────────────
// Check payment status
router.get("/status/:linkId", verifyToken, async (req, res) => {
  try {
    const response = await axios.get(
      `${PAYMONGO_URL}/links/${req.params.linkId}`,
      { headers: paymongoHeaders }
    );

    const status = response.data.data.attributes.status;
    res.json({ status });
  } catch (err) {
    res.status(500).json({ error: "Failed to check payment status" });
  }
});

module.exports = router;