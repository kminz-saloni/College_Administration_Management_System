const express = require('express');
const studentsController = require('../controllers/studentsController');
const { authMiddleware } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');

const router = express.Router();

router.use(authMiddleware);

router.get('/me/eligible-subjects', roleGuard(['student']), studentsController.getEligibleSubjects);
router.get('/me/enrollments', roleGuard(['student']), studentsController.getMyEnrollments);
router.post('/me/enrollments', roleGuard(['student']), studentsController.saveStudentSubjectEnrollments);

module.exports = router;
