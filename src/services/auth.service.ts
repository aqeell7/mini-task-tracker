import jwt from "jsonwebtoken";
import User from "../models/user.model.js"; 
import type { IUser } from "../models/user.model.js";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: Partial<IUser>;
  token: string;
}

export class AuthService {
  
  private generateToken(id: string): string {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
  }

  async register(data: RegisterInput): Promise<AuthResponse> {
    const { name, email, password } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const user = await User.create({ name, email, password });

    const token = this.generateToken(user._id.toString());

    return { user, token };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const token = this.generateToken(user._id.toString());

    const userObj = user.toObject();
    delete userObj.password;

    return { user: userObj, token };
  }
}

export const authService = new AuthService();