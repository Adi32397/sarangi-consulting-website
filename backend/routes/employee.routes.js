const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const { initEmployee } = require('../models/Employee');

const createToken = (employee) => {
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

const employeeAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Employee token missing'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'employee_secret_key');

        req.employee = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid employee token'
        });
    }
};

router.post('/login', async (req, res) => {
    try {
        const { employee_id, password } = req.body;

        const Employee = initEmployee();

        const employee = await Employee.findOne({
            where: { employee_id }
        });

        if (!employee || employee.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Employee ID or password'
            });
        }

        res.json({
            success: true,
            token: createToken(employee),
            employee
        });

    } catch (error) {
        console.error('Employee login error:', error);
        res.status(500).json({
            success: false,
            message: 'Employee login failed'
        });
    }
});

router.get('/profile', employeeAuth, async (req, res) => {
    try {
        const Employee = initEmployee();

        const employee = await Employee.findByPk(req.employee.id);

        res.json({
            success: true,
            employee
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employee profile'
        });
    }
});

router.get('/documents/:type', employeeAuth, async (req, res) => {
    try {
        const Employee = initEmployee();

        const employee = await Employee.findByPk(req.employee.id);

        res.json({
            success: true,
            type: req.params.type,
            employee
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employee document'
        });
    }
});

module.exports = router;