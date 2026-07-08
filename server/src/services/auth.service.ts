import { User, IUser } from '../models/User';
import { generateToken } from '../utils/generateToken';

interface AuthResponse {
  user: IUser;
  token: string;
}

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
  
  const userObject = user.toObject();
  delete userObject.password;

  return { user: userObject as IUser, token };
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

  const userObject = user.toObject();
  delete userObject.password;

  return { user: userObject as IUser, token };
};

/**
 * Service to fetch user statistics by username.
 */
export const getUserStats = async (username: string): Promise<IUser | null> => {
  return User.findOne({ username }).select('-password');
};
