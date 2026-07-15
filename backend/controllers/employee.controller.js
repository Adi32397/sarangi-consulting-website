const { initEmployee } = require('../models/Employee');
const { initIntern } = require('../models/Intern');
const { initDocumentRequest } = require('../models/DocumentRequest');
const { initUploadedDocument } = require('../models/UploadedDocument');

const getEmployeeProfile = async (req, res) => {
    try {
        const role = req.user.role;
        let mappedProfile = {};

        if (role === 'Intern') {
            const Intern = initIntern();
            const intern = await Intern.findOne({ where: { email: req.user.email } });
            
            if (!intern) {
                return res.status(404).json({ success: false, message: 'Intern HR record not found for this email address' });
            }

            // Map intern fields to a standard format
            mappedProfile = {
                id: intern.id,
                employee_id: intern.intern_id,
                name: intern.name,
                email: intern.email,
                phone: intern.phone,
                designation: intern.role, // Interns use 'role'
                department: intern.department,
                joining_date: intern.joining_date,
                salary: intern.stipend, // Interns use 'stipend'
                status: intern.status
            };

        } else {
            const Employee = initEmployee();
            const employee = await Employee.findOne({ where: { email: req.user.email } });
            
            if (!employee) {
                return res.status(404).json({ success: false, message: 'Employee HR record not found for this email address' });
            }

            // Map employee fields
            mappedProfile = {
                id: employee.id,
                employee_id: employee.employee_id,
                name: employee.name,
                email: employee.email,
                phone: employee.phone,
                designation: employee.designation,
                department: employee.department,
                joining_date: employee.joining_date,
                salary: employee.salary,
                status: employee.status
            };
        }

        res.json({
            success: true,
            role: role,
            employee: mappedProfile // Always returns as 'employee' object so frontend doesn't break
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching profile' });
    }
};

const getEmployeeDocument = async (req, res) => {
    try {
        const { type } = req.params;
        const allowedTypes = ['offer', 'salary', 'experience', 'relieving'];

        if (!allowedTypes.includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid document type' });
        }

        const role = req.user.role;
        let mappedProfile = {};

        // Fetch data from the correct table based on role
        if (role === 'Intern') {
            const Intern = initIntern();
            const intern = await Intern.findOne({ where: { email: req.user.email } });
            if (!intern) return res.status(404).json({ success: false, message: 'Intern record not found' });
            
            mappedProfile = {
                employee_id: intern.intern_id,
                name: intern.name,
                email: intern.email,
                phone: intern.phone,
                designation: intern.role,
                department: intern.department,
                joining_date: intern.joining_date,
                salary: intern.stipend,
                status: intern.status
            };
        } else {
            const Employee = initEmployee();
            const employee = await Employee.findOne({ where: { email: req.user.email } });
            if (!employee) return res.status(404).json({ success: false, message: 'Employee record not found' });
            
            mappedProfile = {
                employee_id: employee.employee_id,
                name: employee.name,
                email: employee.email,
                phone: employee.phone,
                designation: employee.designation,
                department: employee.department,
                joining_date: employee.joining_date,
                salary: employee.salary,
                status: employee.status
            };
        }

        res.json({
            success: true,
            type,
            employee: mappedProfile
        });

    } catch (error) {
        console.error('Document error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching document' });
    }
};

// New: Create a document request
const createDocumentRequest = async (req, res) => {
    try {
        const RequestModel = initDocumentRequest();
        const newRequest = await RequestModel.create({
            userId: req.user.id,
            documentType: req.body.documentType,
            reason: req.body.reason
        });
        res.status(201).json({ success: true, request: newRequest });
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({ success: false, message: 'Server error creating request' });
    }
};

// New: Get my requests
const getMyRequests = async (req, res) => {
    try {
        const RequestModel = initDocumentRequest();
        const myRequests = await RequestModel.findAll({ 
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ success: true, data: myRequests });
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ success: false, message: 'Server error fetching requests' });
    }
};

// New: Get my uploaded files
const getMyUploads = async (req, res) => {
    try {
        const UploadModel = initUploadedDocument();
        const myFiles = await UploadModel.findAll({ 
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ success: true, data: myFiles });
    } catch (error) {
        console.error('Error fetching uploads:', error);
        res.status(500).json({ success: false, message: 'Server error fetching uploads' });
    }
};

module.exports = {
    getEmployeeProfile,
    getEmployeeDocument,
    createDocumentRequest,
    getMyRequests,
    getMyUploads
};