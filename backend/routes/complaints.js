const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const ComplaintController = require('../controllers/complaintController');

// Middleware to verify token (basic implementation)
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  // In production, verify JWT token here
  // For now, just pass through
  next();
};

// Routes - specific routes BEFORE generic :id routes
router.post('/', verifyToken, upload.single('image'), ComplaintController.createComplaint);
router.get('/', verifyToken, ComplaintController.getComplaints);
router.get('/officer/:userId', verifyToken, ComplaintController.getOfficerComplaints);
router.post('/validate-image', verifyToken, ComplaintController.validateImage);
router.post('/extract-exif', verifyToken, upload.single('image'), ComplaintController.extractExif);
router.put('/:id/resolve', verifyToken, upload.single('afterImage'), ComplaintController.resolveComplaint);
router.patch('/:id/status', verifyToken, ComplaintController.updateComplaintStatus);
router.post('/:id/feedback', verifyToken, ComplaintController.submitFeedback);
router.get('/:id', verifyToken, ComplaintController.getComplaintById);
router.delete('/:id', verifyToken, ComplaintController.deleteComplaint);

module.exports = router;
