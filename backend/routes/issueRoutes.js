const express = require('express');
const { body } = require('express-validator');
const issueController = require('../controllers/issueController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { upload, uploadToSupabase } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Student: create issue (with optional image)
router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  uploadToSupabase,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category')
      .isIn(['Electrical', 'Water', 'Internet', 'Infrastructure'])
      .withMessage('Invalid category'),
  ],
  issueController.createIssue
);

// Admin: get all issues
router.get('/', authMiddleware, adminMiddleware, issueController.getAllIssues);

// Student: get own issues
router.get('/my', authMiddleware, issueController.getMyIssues);

// Any authenticated: get issue by ID (with ownership/role enforcement)
router.get('/:id', authMiddleware, issueController.getIssueById);

// Admin: update status
router.put(
  '/:id/status',
  authMiddleware,
  adminMiddleware,
  [
    body('status')
      .isIn(['Open', 'In Progress', 'Resolved'])
      .withMessage('Invalid status'),
  ],
  issueController.updateIssueStatus
);

// Admin: update remarks
router.put(
  '/:id/remarks',
  authMiddleware,
  adminMiddleware,
  [body('adminRemarks').trim().optional()],
  issueController.updateIssueRemarks
);

module.exports = router;


