// routes/apply.routes.js
const express = require("express");
const router = express.Router();
const applyController = require("../controllers/apply.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

// Get all applications for a specific job (ALUMNI only)
router.get("/apply/:id", verifyToken, applyController.getApplyController);

// Apply for a job (STUDENT only)
router.post("/apply/:id", verifyToken, applyController.applyForJobController);

// Delete an application (STUDENT only)
router.delete("/apply/:id", verifyToken, applyController.deleteApplyController);

module.exports = router;