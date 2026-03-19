const jwt = require("jsonwebtoken");

// ── Verify JWT Token ──────────────────────────────────────────
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token)
      return res.status(401).json({ error: "Access denied. No token provided." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next(); // move to the next function
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

// ── Check Admin Role ──────────────────────────────────────────
const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin")
    return res.status(403).json({ error: "Access denied. Admins only." });
  next();
};

module.exports = { verifyToken, isAdmin };