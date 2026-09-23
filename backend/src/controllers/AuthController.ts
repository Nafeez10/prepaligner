import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config/env';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        res.status(400).json({ error: 'Email already exists' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = new User({ email, passwordHash });
      await user.save();

      const token = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: '7d' });
      res.json({ token, user: { id: user._id, email: user.email } });
    } catch {
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const token = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: '7d' });
      res.json({ token, user: { id: user._id, email: user.email } });
    } catch {
      res.status(500).json({ error: 'Login failed' });
    }
  }

  static async me(req: Request, res: Response): Promise<void> {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json({ user: { id: user._id, email: user.email } });
    } catch {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
}
