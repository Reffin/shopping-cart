const router = require("express").Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { verifyToken, isAdmin } = require("../middleware/auth");

// ── Send email via Brevo API ──────────────────────────────────
async function sendEmail(to, subject, html) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: "ShopZone", email: "ryancarbonel1984@gmail.com" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }
  return response.json();
}

// ── POST /api/orders ──────────────────────────────────────────
// Protected - place a new order
router.post("/", verifyToken, async (req, res) => {
  try {
    console.log("=== NEW ORDER REQUEST ===");
    console.log("BREVO KEY:", process.env.BREVO_API_KEY ? "EXISTS" : "MISSING");
    const { items, address } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ error: "No items in order" });

    if (!address || !address.fullName || !address.street || !address.city || !address.zip)
      return res.status(400).json({ error: "Complete address is required" });

    // Calculate total from DB prices
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product)
        return res.status(404).json({ error: `Product not found: ${item.productId}` });

      if (product.stock < item.qty)
        return res.status(400).json({ error: `Not enough stock for ${product.name}` });

      total += product.price * item.qty;
      orderItems.push({
        product: product._id,
        name:    product.name,
        price:   product.price,
        qty:     item.qty,
        image:   product.image,
      });

      // Reduce stock
      await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.qty } });
    }

    const order = await Order.create({
      user:  req.user.id,
      items: orderItems,
      total,
      address,
    });

    // Get user email
    const userData = await User.findById(req.user.id).select("email");
    console.log("User email:", userData?.email);
    console.log("BREVO_API_KEY exists:", !!process.env.BREVO_API_KEY);

    // Send order confirmation email
    try {
      const itemsHtml = orderItems.map(item => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #f0f0f0; text-align: center;">x${item.qty}</td>
          <td style="padding: 8px; border-bottom: 1px solid #f0f0f0; text-align: right;">₱${(item.price * item.qty).toFixed(2)}</td>
        </tr>
      `).join("");

      await sendEmail(
        userData.email,
        `🛍️ Order Confirmed! #${order._id.slice(-8).toUpperCase()}`,
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(to right, #f97316, #facc15); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🛍️ ShopZone</h1>
            <p style="color: white; margin: 8px 0 0; opacity: 0.9;">Order Confirmed!</p>
          </div>

          <p style="color: #374151; font-size: 16px;">Hi <strong>${address.fullName}</strong>,</p>
          <p style="color: #6b7280;">Thank you for your order! We've received it and will process it shortly.</p>

          <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #374151;"><strong>Order ID:</strong> #${order._id.slice(-8).toUpperCase()}</p>
            <p style="margin: 8px 0 0; color: #374151;"><strong>Status:</strong> <span style="color: #f97316;">Pending</span></p>
          </div>

          <h3 style="color: #374151; border-bottom: 2px solid #f97316; padding-bottom: 8px;">Items Ordered</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f97316; color: white;">
                <th style="padding: 10px; text-align: left; border-radius: 4px 0 0 4px;">Product</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right; border-radius: 0 4px 4px 0;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px 8px; font-weight: bold; color: #374151;">Total</td>
                <td style="padding: 12px 8px; font-weight: bold; color: #f97316; text-align: right; font-size: 18px;">₱${total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <h3 style="color: #374151; border-bottom: 2px solid #f97316; padding-bottom: 8px;">Shipping Address</h3>
          <div style="background: #f9fafb; border-radius: 8px; padding: 16px;">
            <p style="margin: 0; color: #374151;"><strong>${address.fullName}</strong></p>
            <p style="margin: 4px 0; color: #6b7280;">${address.street}</p>
            <p style="margin: 4px 0; color: #6b7280;">${address.city}, ${address.zip}</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #fff7ed; border-radius: 8px;">
            <p style="color: #6b7280; margin: 0;">Thank you for shopping with us! 💖</p>
            <p style="color: #f97316; font-weight: bold; margin: 8px 0 0;">ShopZone Team</p>
          </div>
        </div>
        `
      );
      console.log("Order confirmation email sent!");
    } catch (emailErr) {
      console.error("Email error:", emailErr.message);
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/orders/my ────────────────────────────────────────
// Protected - get logged in user's orders
router.get("/my", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/orders ───────────────────────────────────────────
// Admin only - get all orders
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/orders/:id/status ──────────────────────────────
// Admin only - update order status
router.patch("/:id/status", verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order)
      return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
