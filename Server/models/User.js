const mongoose = require("mongoose")
const bcrypt   = require('bcrypt')

const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "Name is required"],
      trim:     true,
      minlength: [2,  "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type:      String,
      required:  [true, "Email is required"],
      unique:    true,
      lowercase: true,
      trim:      true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type:      String,
      required:  [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select:    false, // never returned in queries by default
    },

    role: {
      type:    String,
      enum:    { values: ["teacher", "student"], message: "Role must be teacher or student" },
      default: "student",
    },

    // For token invalidation (logout all devices)
    passwordChangedAt: {
      type: Date,
      default: null,
    },

    isActive: {
      type:    Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ─────────────────────────────────────────
// Hash password before saving
// ─────────────────────────────────────────
userSchema.pre("save", async function () {
  // Only hash if password was modified
  if (!this.isModified("password")) return;

  // We don't need try/catch or next(). 
  // Because this is an async function, if it fails, Mongoose catches the error automatically!
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  // Track when password was last changed (for token invalidation)
  if (!this.isNew) {
    this.passwordChangedAt = new Date();
  }
});

// ─────────────────────────────────────────
// Instance method: compare passwords
// ─────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─────────────────────────────────────────
// Instance method: check if token was issued before password change
// ─────────────────────────────────────────
userSchema.methods.wasPasswordChangedAfter = function (jwtIssuedAt) {
  if (!this.passwordChangedAt) return false;
  // jwtIssuedAt is in seconds, passwordChangedAt is a Date
  return this.passwordChangedAt.getTime() / 1000 > jwtIssuedAt;
};

// ─────────────────────────────────────────
// Remove password from JSON output
// ─────────────────────────────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordChangedAt;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("User", userSchema);