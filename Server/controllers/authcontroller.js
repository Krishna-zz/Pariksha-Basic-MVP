const jwt  = require("jsonwebtoken");
const User = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middleware/auth");

// ─────────────────────────────────────────
// Helper: set refresh token as httpOnly cookie
// ─────────────────────────────────────────
const setRefreshTokenCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,                          // JS cannot read this cookie
    secure:   process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict",                      // CSRF protection
    maxAge:   7 * 24 * 60 * 60 * 1000,      // 7 days in ms
  });
};

// ─────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    // 2. Create user (password hashed via pre-save hook)
    const user = await User.create({ name, email, password, role: role || "student" });

    // 3. Generate tokens
    const accessToken  = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // 4. Set refresh token in httpOnly cookie
    setRefreshTokenCookie(res, refreshToken);

    // 5. Respond with user + access token
    res.status(201).json({
      message: "Account created successfully.",
      accessToken,
      user: user.toJSON(), // password stripped by toJSON()
    });
  } catch (err) {
    // Mongoose duplicate key error (race condition safety)
    if (err.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    next(err);
  }
};

// ─────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Find user — explicitly select password (it's select: false by default)
    const user = await User.findOne({ email }).select("+password");

    // 2. Use a single generic message for both wrong email and wrong password
    //    (prevents user enumeration attacks)
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 3. Check account is active
    if (!user.isActive) {
      return res.status(401).json({ message: "This account has been deactivated. Contact support." });
    }

    // 4. Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 5. Generate tokens
    const accessToken  = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // 6. Set refresh token in httpOnly cookie
    setRefreshTokenCookie(res, refreshToken);

    // 7. Respond
    res.status(200).json({
      message: "Logged in successfully.",
      accessToken,
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// POST /api/auth/refresh
// Issues a new access token using the refresh token cookie
// ─────────────────────────────────────────
const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "No refresh token. Please log in." });
    }

    // 1. Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Session expired. Please log in again.", code: "REFRESH_EXPIRED" });
      }
      return res.status(401).json({ message: "Invalid refresh token." });
    }

    // 2. Check user still exists and is active
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User not found or deactivated." });
    }

    // 3. Issue a new access token
    const accessToken = generateAccessToken(user._id, user.role);

    res.status(200).json({ accessToken });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// POST /api/auth/logout
// Clears the refresh token cookie
// ─────────────────────────────────────────
const logout = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out successfully." });
};

// ─────────────────────────────────────────
// GET /api/auth/me
// Returns the currently logged-in user
// Protected route — requires valid access token
// ─────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    // req.user is attached by protect middleware
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ user: user.toJSON() });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, logout, getMe };