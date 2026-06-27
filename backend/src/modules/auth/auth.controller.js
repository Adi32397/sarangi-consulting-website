const authService = require('./auth.service');
const authValidator = require('./auth.validator');

const register = async (req, res, next) => {
  try {
    const validatedData = authValidator.validateRegister(req.body);
    const result = await authService.register(validatedData);
    res.status(201).json(result);
  } catch (error) {
    if (error.message === 'Email already in use') {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const validatedData = authValidator.validateLogin(req.body);
    const result = await authService.login(validatedData.email, validatedData.password);
    res.json(result);
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ message: error.message });
    }
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // For JWT, logout is typically handled client-side by deleting the token.
    // If blacklisting is needed, it would be implemented here.
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout
};
