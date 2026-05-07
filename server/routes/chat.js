const router = require("express").Router();
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) return res.status(400).json({ error: "Message is required" });

    const messages = [
      {
        role: "system",
        content: `You are a helpful shopping assistant for ShopZone — a Philippine e-commerce store owned by Ryan S. Carbonel.

ShopZone currently sells these real products:
- iPhone 15 Pro (Electronics) - ₱59,999
- Asus TUF Gaming A16 Laptop (Electronics) - ₱60,000
- NIKE AIR Shoes (Shoes) - ₱5,999
- LAPTOP Gaming (Electronics) - ₱1,235

Payment methods accepted: GCash, Maya, BPI Online, GrabPay, and Credit/Debit cards via PayMongo.
Shipping is FREE on all orders.
Users can create an account, add to cart, and checkout easily.

Only talk about products that are actually available in the store.
Be friendly, helpful, and concise. Always respond in English unless the customer writes in Filipino.`
      },
      ...history,
      { role: "user", content: message }
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });

  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;