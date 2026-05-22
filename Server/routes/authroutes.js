const express = require("express");
const router  = express.Router();

const { register, login, refresh, logout, getMe } = require("../controllers/authcontroller");
const { protect }                                  = require("../Middleware/auth");
const { registerRules, loginRules }                = require("../Validators/authValidators");

// Public routes
router.post("/register", registerRules, register);
router.post("/login",    loginRules,    login);
router.post("/refresh",                 refresh);   // uses httpOnly cookie
router.post("/logout",                  logout);

// Protected route
router.get("/me", protect, getMe);

module.exports = router;