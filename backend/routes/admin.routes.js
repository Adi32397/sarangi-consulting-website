const express = require('express');
const router = express.Router();

// Import middlewares
const { protect, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// Import controllers (Notice we added createEmployee and createIntern here)
const { 
    getAllRequests, 
    updateRequestStatus, 
    uploadDocument, 
    getAllHRRecords,
    createEmployee,
    createIntern
} = require('../controllers/admin.controller');

// 1. View All Pending Requests
router.get('/document-requests', protect, authorize('Admin', 'Super Admin'), getAllRequests);

// 2. Update Request Status
router.put('/document-requests/:id', protect, authorize('Admin', 'Super Admin'), updateRequestStatus);

// 3. Upload a Document
router.post('/upload-document', protect, authorize('Admin', 'Super Admin'), upload.single('document'), uploadDocument);

// 4. Get all HR records for the tables
router.get('/hr-records', protect, authorize('Admin', 'Super Admin'), getAllHRRecords);

// 5. Create new Employee and Intern
router.post('/employees', protect, authorize('Admin', 'Super Admin'), createEmployee);
router.post('/interns', protect, authorize('Admin', 'Super Admin'), createIntern);

module.exports = router;