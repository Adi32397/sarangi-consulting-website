const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middlewares/auth.middleware'); 
const { 
    getEmployeeProfile, 
    getEmployeeDocument,
    createDocumentRequest,
    getMyRequests,
    getMyUploads
} = require('../controllers/employee.controller');

// Existing Routes
router.get('/profile', protect, authorize('Employee', 'Intern', 'Admin', 'Super Admin'), getEmployeeProfile);
router.get('/documents/:type', protect, authorize('Employee', 'Intern', 'Admin', 'Super Admin'), getEmployeeDocument);

// New Document Request Routes
router.post('/requests', protect, authorize('Employee', 'Intern'), createDocumentRequest);
router.get('/requests', protect, authorize('Employee', 'Intern'), getMyRequests);
router.get('/my-uploads', protect, authorize('Employee', 'Intern'), getMyUploads);

module.exports = router;