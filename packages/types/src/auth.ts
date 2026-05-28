import { BaseEntity } from './common';

export interface User extends BaseEntity {
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  lastLoginAt?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  EDITOR = 'editor',
  VIEWER = 'viewer',
  CITIZEN = 'citizen'
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}