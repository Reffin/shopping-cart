const router = require("express").Router();
const Review = require("../models/Review");
const Order = require("../models/Order");
const { verifyToken } = require("../middleware/auth");

// ── GET /api/reviews/:productId ───────────────────────────────
// Public - get all reviews for a product
router.get("/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({ reviews, avgRating: Math.round(avgRating * 10) / 10, total: reviews.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/reviews/:productId ──────────────────────────────
// Protected - add a review (must have purchased the product)
router.post("/:productId", verifyToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ error: "Rating and comment are required" });
    }

    // Check if user has purchased this product
    const hasPurchased = await Order.findOne({
      user: req.user.id,
      "items.product": req.params.productId,
      status: { $in: ["delivered", "shipped", "processing"] },
    });

    if (!hasPurchased) {
      return res.status(403).json({ error: "You can only review products you have purchased" });
    }

    // Create review
    const review = await Review.create({
      product: req.params.productId,
      user: req.user.id,
      rating,
      comment,
    });

    const populated = await review.populate("user", "name");
    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "You have already reviewed this product" });
    }
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/reviews/:id ───────────────────────────────────
// Protected - delete your own review
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to delete this review" });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;