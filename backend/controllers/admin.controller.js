// Import the models we defined earlier
// Note: Ensure the paths match where you saved DocumentRequest.js and UploadedDocument.js
const { initDocumentRequest } = require('../models/DocumentRequest'); 
const { initUploadedDocument } = require('../models/UploadedDocument'); 
const { initEmployee } = require('../models/Employee');
const { initIntern } = require('../models/Intern');
const { initUser } = require('../models/User');

// @desc    Get all document requests from employees/interns
// @route   GET /api/admin/document-requests
// @access  Private (Admin/Super Admin)
const getAllRequests = async (req, res) => {
    try {
        const RequestModel = initDocumentRequest();
        
        // Fetch all requests, ordered by the newest first
        const requests = await RequestModel.findAll({
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ success: false, message: 'Server Error fetching requests' });
    }
};

// @desc    Update the status of a document request
// @route   PUT /api/admin/document-requests/:id
// @access  Private (Admin/Super Admin)
const updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const RequestModel = initDocumentRequest();

        // Find the specific request by its ID
        const request = await RequestModel.findByPk(req.params.id);
        
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        // Update the status and save to database
        request.status = status;
        await request.save();

        res.status(200).json({
            success: true,
            message: 'Request status updated successfully',
            data: request
        });
    } catch (error) {
        console.error('Error updating request status:', error);
        res.status(500).json({ success: false, message: 'Server Error updating request' });
    }
};

// @desc    Upload a document for a specific user
// @route   POST /api/admin/upload-document
// @access  Private (Admin/Super Admin)
const uploadDocument = async (req, res) => {
    try {
        // req.file is automatically attached by the Multer middleware if the upload succeeds
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please attach a file to upload' });
        }

        const { userId, title } = req.body;

        // Validate that we have the necessary data
        if (!userId || !title) {
            return res.status(400).json({ success: false, message: 'User ID and Document Title are required' });
        }

        const UploadModel = initUploadedDocument();

        // Create the database record linking the file to the specific user
        const newDocument = await UploadModel.create({
            userId: userId,
            title: title,
            filePath: `uploads/documents/${req.file.filename}`, // This is the physical location on your server where Multer saved the file
            uploadedBy: req.user.id  // Tracks which Admin uploaded it (from the auth token)
        });

        res.status(201).json({
            success: true,
            message: 'Document uploaded and assigned successfully',
            document: newDocument
        });
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ success: false, message: 'Server Error during file upload' });
    }
};

// @desc    Get all Employees and Interns
// @route   GET /api/admin/hr-records
// @access  Private (Admin/Super Admin)
const getAllHRRecords = async (req, res) => {
    try {
        const Employee = initEmployee();
        const Intern = initIntern();

        // Fetch from both separate tables
        const employees = await Employee.findAll({ order: [['createdAt', 'DESC']] });
        const interns = await Intern.findAll({ order: [['createdAt', 'DESC']] });

        res.status(200).json({ 
            success: true, 
            data: {
                employees: employees,
                interns: interns
            } 
        });
    } catch (error) {
        console.error('Error fetching HR records:', error);
        res.status(500).json({ success: false, message: 'Server error fetching records' });
    }
};

const generateCompanyEmail = async (fullName) => {
    const User = initUser();
    // Convert "Rajiv Sharma" to "rajiv.sharma"
    const baseName = fullName.trim().toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
    let email = `${baseName}@sarangi.com`;
    let counter = 1;
    
    // Check if email exists, if yes, add a number (rajiv.sharma1@sarangi.com)
    while (await User.findOne({ where: { email: email } })) {
        email = `${baseName}${counter}@sarangi.com`;
        counter++;
    }
    return email;
};

// 2. Generate a secure random password (e.g., aB7!x9Km)
const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 10; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

// --- UPDATED CREATE FUNCTIONS ---

// @desc    Create a new Employee
const createEmployee = async (req, res) => {
    try {
        const Employee = initEmployee();
        const User = initUser();

        // Auto-generate credentials
        const generatedEmail = await generateCompanyEmail(req.body.name);
        const generatedPassword = generateRandomPassword();

        // 1. Create the Login Account
        const newAuthUser = await User.create({
            name: req.body.name,
            email: generatedEmail, // Use generated email
            password: generatedPassword, // Hook hashes this automatically
            phone: req.body.phone,
            role: 'Employee'
        });

        // 2. Create the HR Record
        const employee_id = 'EMP' + Math.floor(1000 + Math.random() * 9000);
        const newEmp = await Employee.create({
            employee_id: employee_id,
            name: req.body.name,
            email: generatedEmail,
            phone: req.body.phone,
            joining_date: req.body.joining_date || new Date(),
            department: req.body.department || 'General',
            designation: req.body.designation || 'Staff',
            salary: req.body.salary || 0,
            status: req.body.status || 'Active',
            password: generatedPassword 
        });
        
        // Send the plain-text credentials BACK to the admin so they can copy them
        res.status(201).json({ 
            success: true, 
            data: newEmp,
            credentials: { email: generatedEmail, password: generatedPassword }
        });
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ success: false, message: 'Server error creating employee' });
    }
};

// @desc    Create a new Intern
const createIntern = async (req, res) => {
    try {
        const Intern = initIntern();
        const User = initUser();

        // Auto-generate credentials
        const generatedEmail = await generateCompanyEmail(req.body.name);
        const generatedPassword = generateRandomPassword();

        // 1. Create the Login Account
        const newAuthUser = await User.create({
            name: req.body.name,
            email: generatedEmail,
            password: generatedPassword,
            phone: req.body.phone,
            role: 'Intern'
        });

        // 2. Create the HR Record
        const intern_id = 'INT' + Math.floor(1000 + Math.random() * 9000);
        const newIntern = await Intern.create({
            intern_id: intern_id,
            name: req.body.name,
            email: generatedEmail,
            phone: req.body.phone,
            joining_date: req.body.joining_date || new Date(),
            department: req.body.department || 'General',
            role: req.body.role || 'Intern',
            stipend: req.body.stipend || 0,
            status: req.body.status || 'Active'
        });
        
        // Send the plain-text credentials BACK to the admin
        res.status(201).json({ 
            success: true, 
            data: newIntern,
            credentials: { email: generatedEmail, password: generatedPassword }
        });
    } catch (error) {
        console.error('Error creating intern:', error);
        res.status(500).json({ success: false, message: 'Server error creating intern' });
    }
};

module.exports = {
    getAllRequests,
    updateRequestStatus,
    uploadDocument,
    getAllHRRecords,
    createEmployee,
    createIntern
};