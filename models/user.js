const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    rol: {
      type: String,
      enum: ["cliente", "admin", "paseador"],
      default: "cliente",
    },
    foto: {
      type: String,
      default: "",
    },
    refreshToken: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("user", userSchema);
