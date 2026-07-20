import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { generateToken, generateAccessToken, generateRefreshToken } from '../utils/generateToken';
import { TokenPayload } from '../types/auth';

interface AuthResponse {
  user: IUser;
  token: string;
  accessToken?: string;
  refreshToken?: string;
}

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret-key-for-development-only';

/**
 * Service to register a new user.
 */
export const registerUser = async (
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw new Error('Username is already taken');
  }

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new Error('Email is already registered');
  }

  const user = await User.create({
    username,
    email,
    password,
  });

  const token = generateToken(user._id.toString(), user.username);
  const accessToken = generateAccessToken(user._id.toString(), user.username);
  const refreshToken = generateRefreshToken(user._id.toString(), user.username);
  
  const userObject = user.toObject();
  delete userObject.password;

  return { user: userObject as IUser, token, accessToken, refreshToken };
};

/**
 * Service to login an existing user.
 */
export const loginUser = async (
  usernameOrEmail: string,
  password: string
): Promise<AuthResponse> => {
  const user = await User.findOne({
    $or: [
      { username: usernameOrEmail },
      { email: usernameOrEmail.toLowerCase() },
    ],
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user._id.toString(), user.username);
  const accessToken = generateAccessToken(user._id.toString(), user.username);
  const refreshToken = generateRefreshToken(user._id.toString(), user.username);

  const userObject = user.toObject();
  delete userObject.password;

  return { user: userObject as IUser, token, accessToken, refreshToken };
};

/**
 * Service to refresh access token using a valid refresh token.
 */
export const refreshUserToken = async (refreshTokenStr: string): Promise<{ accessToken: string; refreshToken: string }> => {
  const decoded = jwt.verify(refreshTokenStr, REFRESH_TOKEN_SECRET) as TokenPayload;
  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new Error('User no longer exists');
  }

  const newAccessToken = generateAccessToken(user._id.toString(), user.username);
  const newRefreshToken = generateRefreshToken(user._id.toString(), user.username);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

/**
 * Service to fetch user statistics by username.
 */
export const getUserStats = async (username: string): Promise<IUser | null> => {
  return User.findOne({ username }).select('-password');
};
