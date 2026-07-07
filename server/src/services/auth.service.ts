import { User, IUser } from '../models/User';
import { generateToken } from '../utils/generateToken';

interface AuthResponse {
  user: IUser;
  token: string;
}

/**
 * Service to login or register a user by username.
 */
export const loginOrRegister = async (username: string): Promise<AuthResponse> => {
  let user = await User.findOne({ username });

  if (!user) {
    user = await User.create({ username });
  }

  const token = generateToken(user._id.toString(), user.username);

  return { user, token };
};

/**
 * Service to fetch user statistics by username.
 */
export const getUserStats = async (username: string): Promise<IUser | null> => {
  return User.findOne({ username });
};
