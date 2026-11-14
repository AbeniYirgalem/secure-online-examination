import * as authService from '../services/auth.service.js';
import { getCookieOptions } from '../utils/jwt.js';

/**
 * Handle new student account registration.
 * Sets HttpOnly JWT cookie and returns sanitized user data.
 */
export const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.registerUser(req.body);

    // Set secure HttpOnly cookie
    res.cookie('token', token, getCookieOptions());

    res.status(201).json({
      success: true,
      message: 'Student account registered successfully.',
      data: {
        user,
        token, // Included for non-browser/header-based clients
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user credential authentication (login).
 * Sets HttpOnly JWT cookie upon success.
 */
export const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.loginUser(req.body);

    // Set secure HttpOnly cookie
    res.cookie('token', token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve currently authenticated user profile.
 */
export const me = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUserProfile(req.user.id);
    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user session logout.
 * Clears the HttpOnly JWT cookie.
 */
export const logout = async (req, res) => {
  res.clearCookie('token', getCookieOptions());
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * Test endpoint to verify RBAC enforcement for ADMIN role.
 */
export const adminOnlyEndpoint = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin access verified.',
    data: {
      user: req.user,
    },
  });
};
