const express = require('express');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { validate, validateLead } = require('../middlewares/validation.middleware');
const {
    createLead,
    getLeads,
    getLead,
    updateLead,
    deleteLead,
    updateStatus,
    updatePriority,
    assignConsultant,
    addNote,
    addFollowup,
    bulkDelete,
    bulkAssign,
    bulkStatus,
    exportLeads,
    getDashboardStats,
    getAnalytics
} = require('../controllers/lead.controller');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Analytics and Dashboard routes (must be above /:id)
router.get('/stats/dashboard', getDashboardStats);
router.get('/stats/analytics', getAnalytics);

// Bulk operations (must be above /:id)
router.post('/bulk/delete', authorize('Super Admin', 'Admin'), bulkDelete);
router.post('/bulk/assign', authorize('Super Admin', 'Admin', 'Manager'), bulkAssign);
router.post('/bulk/status', authorize('Super Admin', 'Admin', 'Manager'), bulkStatus);
router.post('/export', exportLeads);

// Base CRUD routes
router.route('/')
    .get(getLeads)
    .post(authorize('Super Admin', 'Admin', 'Manager'), validateLead, validate, createLead);

router.route('/:id')
    .get(getLead)
    .put(authorize('Super Admin', 'Admin', 'Manager'), validateLead, validate, updateLead)
    .delete(authorize('Super Admin', 'Admin'), deleteLead);

// Action routes
router.patch('/:id/status', updateStatus);
router.patch('/:id/priority', authorize('Super Admin', 'Admin', 'Manager'), updatePriority);
router.patch('/:id/assign', authorize('Super Admin', 'Admin', 'Manager'), assignConsultant);
router.post('/:id/note', addNote);
router.post('/:id/followup', addFollowup);

module.exports = router;
