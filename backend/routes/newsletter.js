const express = require("express");
const router = express.Router();
const Newsletter = require("../models/newsletter");

// POST /api/newsletter/subscribe
router.post("/subscribe", async (req, res) => {
    // 1. Basic validation and early exit
    if (!req.body.email || req.body.email.trim() === "") {
        // Explicitly set 400 Bad Request status
        return res.status(400).json({ 
            success: false, 
            message: "Email is required for subscription." 
        });
    }

    try {
        const { email } = req.body;
        console.log("Received Email for Subscription:", email); // DEBUG

        // 2. Database Operation
        // Check if the email already exists to prevent duplicates (UX improvement)
        const existingSubscriber = await Newsletter.findOne({ email });

        if (existingSubscriber) {
            // Return 409 Conflict if email is already there
            return res.status(409).json({ 
                success: false, 
                message: "This email is already subscribed to the newsletter." 
            });
        }
        
        // Save to DB
        await Newsletter.create({ email });

        // 3. Success Response
        // Use 201 Created for successfully saving a new resource
        return res.status(201).json({ 
            success: true, 
            message: "Subscribed successfully! Thank you." 
        });

    } catch (err) {
        // 4. Detailed Error Handling
        console.error("Newsletter subscription database error:", err);
        // Explicitly set 500 Internal Server Error status
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error. Could not process subscription." 
        });
    }
});

module.exports = router;