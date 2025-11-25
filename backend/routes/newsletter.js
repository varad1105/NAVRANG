const express = require("express");
const router = express.Router();
const Newsletter = require("../models/newsletter");

// POST /api/newsletter/subscribe
router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;

    console.log("Received Email:", email); // DEBUG

    if (!email || email.trim() === "") {
      return res.status(400).json({ error: "Email is required" });
    }

    // Save to DB
    await Newsletter.create({ email });

    res.json({ message: "Subscribed successfully!" });
  } catch (err) {
    console.error("Newsletter error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
