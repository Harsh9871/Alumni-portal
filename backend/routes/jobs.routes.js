const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// GET /jobs - Get all jobs with optional filters
router.get('/', jobController.getJobsController);

// GET /jobs/my - Get current alumni's jobs
router.get('/my', verifyToken, jobController.getMyJobsController);

// GET /jobs/:id - Get job by ID
router.get('/:id', verifyToken, jobController.getJobByIdController);

// POST /jobs - Create new job (Alumni only)
router.post('/', verifyToken, jobController.createJobController);

// PUT /jobs/:id - Update job (Job owner only)
router.put('/:id', verifyToken, jobController.updateJobController);

// DELETE /jobs/:id - Delete job (Job owner only)
router.delete('/:id', verifyToken, jobController.deleteJobController);

module.exports = router;