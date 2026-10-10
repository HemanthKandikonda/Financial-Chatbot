import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import ChatbotConfig from '../models/ChatbotConfig.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, currency, monthlyIncome, financialGoal } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        error: 'This email is already registered. Please sign in to your existing account.',
        emailExists: true,
        email: normalizedEmail,
      });
    }

    const user = await User.create({
      name: (name || '').trim(),
      email: normalizedEmail,
      password,
      currency: currency || 'USD',
      monthlyIncome: monthlyIncome || 0,
      financialGoal: financialGoal || '',
    });

    // Create default chatbot config
    await ChatbotConfig.create({ userId: user._id });

    const token = signToken(user._id);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        error: 'This email is already registered. Please sign in to your existing account.',
        emailExists: true,
      });
    }
    next(err);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated.' });
    }

    const token = signToken(user._id);

    res.json({
      message: 'Login successful.',
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

// PUT /api/auth/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, currency, monthlyIncome, financialGoal } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, currency, monthlyIncome, financialGoal },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Profile updated.', user: updatedUser });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
};
