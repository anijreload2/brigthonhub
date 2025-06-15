
// Authentication utilities for BrightonHub
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, UserRole } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'brightonhub-secret-key';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  try {
    // First try to get token from cookie
    let token = request.cookies.get('auth-token')?.value;
    
    // If no cookie, try Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) return null;
    
    return verifyToken(token);
  } catch (error) {
    return null;
  }
}

export function requireAuth(request: NextRequest): AuthUser {
  const user = getAuthUser(request);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export function requireRole(request: NextRequest, allowedRoles: UserRole[]): AuthUser {
  const user = requireAuth(request);
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions');
  }
  return user;
}

export function isAdmin(user: AuthUser): boolean {
  return user.role === UserRole.ADMIN;
}

export function isAgent(user: AuthUser): boolean {
  return user.role === UserRole.AGENT || user.role === UserRole.ADMIN;
}

export function isVendor(user: AuthUser): boolean {
  return user.role === UserRole.VENDOR || user.role === UserRole.ADMIN;
}

export function canManageProperty(user: AuthUser): boolean {
  return user.role === UserRole.AGENT || user.role === UserRole.ADMIN;
}

export function canManageFood(user: AuthUser): boolean {
  return user.role === UserRole.VENDOR || user.role === UserRole.ADMIN;
}

export function canManageStore(user: AuthUser): boolean {
  return user.role === UserRole.VENDOR || user.role === UserRole.ADMIN;
}

export function canManageProjects(user: AuthUser): boolean {
  return user.role === UserRole.AGENT || user.role === UserRole.ADMIN;
}

export function canManageBlog(user: AuthUser): boolean {
  return user.role === UserRole.ADMIN;
}
