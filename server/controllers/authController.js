import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { signToken, setAuthCookie, clearAuthCookie } from '../utils/token.js';
import { normalizeList } from '../utils/helpers.js';

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, college, skills, companyName, designation } = req.body;

  if (await User.exists({ email })) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  // Whitelist fields per role (never pass req.body straight to the database).
  const data = { name, email, password, role };
  if (role === 'student') {
    data.college = college || '';
    data.skills = normalizeList(skills);
  } else {
    data.companyName = companyName;
    data.designation = designation || '';
  }

  const user = await User.create(data); // password is hashed by the model's pre-save hook
  setAuthCookie(res, signToken(user._id));
  sendSuccess(res, 201, 'Registration successful', { user });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  const passwordOk = user ? await user.comparePassword(password) : false;

  // Same message for "no such user" and "wrong password" (prevents user enumeration).
  if (!passwordOk) throw new ApiError(401, 'Invalid email or password');

  setAuthCookie(res, signToken(user._id));
  sendSuccess(res, 200, 'Login successful', { user });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  sendSuccess(res, 200, 'Logged out successfully');
});

// GET /api/auth/me   (protected)
export const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, 'Current user', { user: req.user });
});
