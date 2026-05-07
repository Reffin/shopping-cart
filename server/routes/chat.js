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
        content: `You are a helpful shopping assistant for ShopZone — a Philippine e-commerce store. 
        You help customers find products, answer questions about orders, shipping, and payments.
        ShopZone accepts GCash, Maya, BPI Online, and Credit/Debit cards via PayMongo.
        Shipping is free. You are friendly, helpful, and concise.
        Always respond in English unless the customer writes in Filipino.`
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