import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

/**
 * Service to register a new student account.
 * Enforces email uniqueness, role normalization (STUDENT only), and password hashing.
 */
export const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  // Check for duplicate account
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error('An account with this email address already exists.');
    error.status = 409;
    throw error;
  }

  // Create student account - public registration strictly assigns STUDENT role
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: 'STUDENT',
    isActive: true,
  });

  const token = generateToken(user);

  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Service to authenticate user credentials.
 * Protects against account enumeration by returning generic credential failure errors.
 */
export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  // Select password field explicitly since select: false in schema
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    throw error;
  }

  // Verify bcrypt password hash
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    throw error;
  }

  // Check account activation status
  if (!user.isActive) {
    const error = new Error('Account is deactivated. Please contact an administrator.');
    error.status = 403;
    throw error;
  }

  const token = generateToken(user);

  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Service to retrieve current user profile by authenticated ID.
 */
export const getCurrentUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User profile not found.');
    error.status = 404;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Account is deactivated.');
    error.status = 403;
    throw error;
  }

  return user.toJSON();
};
