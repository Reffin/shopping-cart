const router = require("express").Router();
const Product = require("../models/Product");
const { verifyToken, isAdmin } = require("../middleware/auth");
const { upload, uploadToCloudinary } = require("../middleware/upload");

// ── GET /api/products ─────────────────────────────────────────
// Public - get all products with search & filter
router.get("/", async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = {};

    // Filter by category
    if (category && category !== "All")
      query.category = category;

    // Search by name
    if (search)
      query.name = { $regex: search, $options: "i" };

    // Sort options
    let sortOption = { createdAt: -1 }; // newest first by default
    if (sort === "price-asc")  sortOption = { price: 1 };
    if (sort === "price-desc") sortOption = { price: -1 };
    if (sort === "name")       sortOption = { name: 1 };

    const products = await Product.find(query).sort(sortOption);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/products/featured ────────────────────────────────
// Public - get featured products for homepage
router.get("/featured", async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).limit(6);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// ── POST /api/products/upload ─────────────────────────────────
router.post("/upload", verifyToken, isAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }
    const result = await uploadToCloudinary(req.file.buffer);
    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/products/:id ─────────────────────────────────────
// Public - get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/products ────────────────────────────────────────
// Admin only - create product
router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, description, price, image, category, stock, featured } = req.body;
    if (!name || !description || !price || !category)
      return res.status(400).json({ error: "Required fields missing" });

    const product = await Product.create({ name, description, price, image, category, stock, featured });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/products/:id ─────────────────────────────────────
// Admin only - update product
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product)
      return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/products/:id ──────────────────────────────────
// Admin only - delete product
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;