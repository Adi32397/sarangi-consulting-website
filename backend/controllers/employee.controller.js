const jwt = require('jsonwebtoken');
const { initEmployee } = require('../models/Employee');

const generateToken = (employee) => {
    return jwt.sign(
        {
            id: employee.id,
            employee_id: employee.employee_id,
            role: 'employee'
        },
        process.env.JWT_SECRET || 'employee_secret_key',
        { expiresIn: '7d' }
    );
};

const employeeLogin = async (req, res) => {
    try {
        const { employee_id, password } = req.body;

        if (!employee_id || !password) {
            return res.status(400).json({
                success: false,
                message: 'Employee ID and password are required'
            });
        }

        const Employee = initEmployee();

        const employee = await Employee.findOne({
            where: { employee_id }
        });

        if (!employee || employee.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid employee ID or password'
            });
        }

        const token = generateToken(employee);

        res.json({
            success: true,
            message: 'Login successful',
            token,
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
        console.error('Employee login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during employee login'
        });
    }
};

const getEmployeeProfile = async (req, res) => {
    try {
        const Employee = initEmployee();

        const employee = await Employee.findByPk(req.employee.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
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
        const employee = await Employee.findByPk(req.employee.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
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
    employeeLogin,
    getEmployeeProfile,
    getEmployeeDocument
};