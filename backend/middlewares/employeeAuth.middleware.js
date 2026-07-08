const jwt = require('jsonwebtoken');

const employeeAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Employee authorization token missing'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'employee_secret_key'
        );

        if (decoded.role !== 'employee') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        req.employee = decoded;
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired employee token'
        });
    }
};

module.exports = employeeAuth;