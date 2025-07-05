const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/',  jobController.getJobsController);
router.get('/:id', jobController.getJobByIdController);
router.post('/', verifyToken, jobController.createJobController);
router.put('/:id', verifyToken, jobController.updateJobController);
router.delete('/:id', verifyToken, jobController.deleteJobController);

module.exports = router;