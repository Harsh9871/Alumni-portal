const express = require("express");
const router = express.Router();
const applyController = require("../controllers/apply.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/apply/:id", verifyToken, applyController.getApplyController); // for alimni to get all applied jobs for a perticluar post
router.post("/apply/:id", verifyToken, applyController.applyForJobController); // for student to apply for a job for a perticular post
router.delete("/apply/:id", verifyToken, applyController.deleteApplyController); // for student to delete an applied job for a perticular post

module.exports = router;