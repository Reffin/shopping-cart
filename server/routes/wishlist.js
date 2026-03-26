const router = require("express").Router();
const Wishlist = require("../models/Wishlist");
const { verifyToken } = require("../middleware/auth");

// ── GET /api/wishlist ─────────────────────────────────────────
// Protected - get user's wishlist
router.get("/", verifyToken, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate("products");
    res.json(wishlist ? wishlist.products : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/wishlist/:productId ─────────────────────────────
// Protected - add product to wishlist
router.post("/:productId", verifyToken, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        products: [req.params.productId],
      });
    } else {
      // Check if already in wishlist
      if (wishlist.products.includes(req.params.productId)) {
        return res.status(400).json({ error: "Product already in wishlist" });
      }
      wishlist.products.push(req.params.productId);
      await wishlist.save();
    }

    res.json({ message: "Added to wishlist" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/wishlist/:productId ───────────────────────────
// Protected - remove product from wishlist
router.delete("/:productId", verifyToken, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) return res.status(404).json({ error: "Wishlist not found" });

    wishlist.products = wishlist.products.filter(
      p => p.toString() !== req.params.productId
    );
    await wishlist.save();

    res.json({ message: "Removed from wishlist" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;