import { User } from "./auth";

export interface UserProfile extends User {
  bio?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  nationality?: string;
  languages: string[];
  preferences: UserPreferences;
}

export interface UserPreferences {
  notifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  timezone: string;
  theme: "light" | "dark" | "system";
}

export interface UpdateUserProfile {
  name?: string;
  bio?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  preferences?: Partial<UserPreferences>;
}
