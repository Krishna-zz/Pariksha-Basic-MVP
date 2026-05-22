const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// ─────────────────────────────────────────
// Helper: generate access token (short-lived)
// ─────────────────────────────────────────
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" }
  );
};

// ─────────────────────────────────────────
// Helper: generate refresh token (long-lived)
// ─────────────────────────────────────────
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
  );
};

// ─────────────────────────────────────────
// Middleware: protect — verifies JWT
// Attaches req.user = { id, role }
// ─────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authenticated. Please log in." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token missing." });
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Session expired. Please log in again.", code: "TOKEN_EXPIRED" });
      }
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token." });
      }
      throw err;
    }

    // 3. Check user still exists and is active
    const user = await User.findById(decoded.id).select("+passwordChangedAt isActive");
    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }
    if (!user.isActive) {
      return res.status(401).json({ message: "Account has been deactivated." });
    }

    // 4. Check if password was changed after token was issued
    if (user.wasPasswordChangedAfter(decoded.iat)) {
      return res.status(401).json({ message: "Password was changed. Please log in again." });
    }

    // 5. Attach user info to request
    req.user = { id: user._id.toString(), role: user.role, name: user.name };
    next();
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// Middleware: teacherOnly
// Must be used AFTER protect
// ─────────────────────────────────────────
const teacherOnly = (req, res, next) => {
  if (req.user?.role !== "teacher") {
    return res.status(403).json({ message: "Access denied. Teachers only." });
  }
  next();
};

// ─────────────────────────────────────────
// Middleware: studentOnly
// Must be used AFTER protect
// ─────────────────────────────────────────
const studentOnly = (req, res, next) => {
  if (req.user?.role !== "student") {
    return res.status(403).json({ message: "Access denied. Students only." });
  }
  next();
};

module.exports = {
  protect,
  teacherOnly,
  studentOnly,
  generateAccessToken,
  generateRefreshToken,
};