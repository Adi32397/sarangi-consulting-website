const express = require('express');
const router = express.Router();

// Import both protect and authorize from the unified auth middleware
const { protect, authorize } = require('../middlewares/auth.middleware'); 
const { 
    getEmployeeProfile, 
    getEmployeeDocument 
} = require('../controllers/employee.controller');

// ONLY allow Employees (and Admins) to access these HR routes
router.get('/profile', protect, authorize('Employee', 'Admin', 'Super Admin'), getEmployeeProfile);
router.get('/documents/:type', protect, authorize('Employee', 'Admin', 'Super Admin'), getEmployeeDocument);

module.exports = router;