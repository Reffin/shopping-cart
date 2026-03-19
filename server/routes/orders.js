const router = require("express").Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const { verifyToken, isAdmin } = require("../middleware/auth");

// ── POST /api/orders ──────────────────────────────────────────
// Protected - place a new order
router.post("/", verifyToken, async (req, res) => {
  try {
    const { items, address } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ error: "No items in order" });

    if (!address || !address.fullName || !address.street || !address.city || !address.zip)
      return res.status(400).json({ error: "Complete address is required" });

    // Calculate total from DB prices (never trust frontend prices!)
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
  }
});

module.exports = router;