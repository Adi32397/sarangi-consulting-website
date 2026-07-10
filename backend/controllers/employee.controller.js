const { initEmployee } = require('../models/Employee');

const getEmployeeProfile = async (req, res) => {
    try {
        const Employee = initEmployee();

        // Look up the employee using the email from the unified token (req.user)
        const employee = await Employee.findOne({ where: { email: req.user.email } });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee record not found for this email address'
            });
        }

        res.json({
            success: true,
            employee: {
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
            }
        });

    } catch (error) {
        console.error('Employee profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching employee profile'
        });
    }
};

const getEmployeeDocument = async (req, res) => {
    try {
        const { type } = req.params;
        const allowedTypes = ['offer', 'salary', 'experience', 'relieving'];

        if (!allowedTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid document type'
            });
        }

        const Employee = initEmployee();
        
        // Look up the employee using the email from the unified token (req.user)
        const employee = await Employee.findOne({ where: { email: req.user.email } });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee record not found for this email address'
            });
        }

        res.json({
            success: true,
            type,
            employee: {
                employee_id: employee.employee_id,
                name: employee.name,
                email: employee.email,
                phone: employee.phone,
                designation: employee.designation,
                department: employee.department,
                joining_date: employee.joining_date,
                salary: employee.salary,
                status: employee.status
            }
        });

    } catch (error) {
        console.error('Employee document error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching employee document'
        });
    }
};

module.exports = {
    getEmployeeProfile,
    getEmployeeDocument
};