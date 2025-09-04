/**
 * User service demonstrating RPC pattern with functional programming
 * Uses snake_case for service names as per project guidelines
 */

import { Result, ok, err } from "../utils/functional";

// Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  colourPreference?: string; // UK English spelling
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  colourPreference?: string;
}

export interface UpdateUserRequest {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  colourPreference?: string;
  isActive?: boolean;
}

// In-memory storage for demonstration (replace with real database)
let users: User[] = [];
let nextId = 1;

// Pure functions for business logic
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateUserData = (data: Partial<CreateUserRequest>): Result<CreateUserRequest, string> => {
  if (!data.firstName?.trim()) {
    return err("First name is required");
  }
  if (!data.lastName?.trim()) {
    return err("Last name is required");
  }
  if (!data.email?.trim()) {
    return err("Email is required");
  }
  if (!validateEmail(data.email)) {
    return err("Invalid email format");
  }

  return ok({
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: data.email.trim().toLowerCase(),
    colourPreference: data.colourPreference,
  });
};

const createUserEntity = (data: CreateUserRequest): User => {
  const now = new Date();
  return {
    id: nextId.toString(),
    ...data,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
};

const updateUserEntity = (existing: User, updates: UpdateUserRequest): User => {
  return {
    ...existing,
    ...updates,
    updatedAt: new Date(),
  };
};

// Service functions (RPC pattern)
export const user_service = {
  // Create user
  create_user: (request: CreateUserRequest): Result<User, string> => {
    const validation = validateUserData(request);
    if (!validation.success) {
      return validation;
    }

    const user = createUserEntity(validation.data);
    users.push(user);
    nextId++;

    return ok(user);
  },

  // Get user by ID
  get_user_by_id: (id: string): Result<User, string> => {
    const user = users.find((u) => u.id === id);
    if (!user) {
      return err("User not found");
    }
    return ok(user);
  },

  // Get all users
  get_all_users: (): User[] => {
    return [...users]; // Return copy to prevent mutation
  },

  // Update user
  update_user: (request: UpdateUserRequest): Result<User, string> => {
    const existingUser = users.find((u) => u.id === request.id);
    if (!existingUser) {
      return err("User not found");
    }

    // Validate email if provided
    if (request.email && !validateEmail(request.email)) {
      return err("Invalid email format");
    }

    const updatedUser = updateUserEntity(existingUser, request);

    // Replace in array
    const index = users.findIndex((u) => u.id === request.id);
    users[index] = updatedUser;

    return ok(updatedUser);
  },

  // Delete user (soft delete by marking inactive)
  delete_user: (id: string): Result<User, string> => {
    const user = users.find((u) => u.id === id);
    if (!user) {
      return err("User not found");
    }

    const deletedUser = updateUserEntity(user, { id, isActive: false });

    const index = users.findIndex((u) => u.id === id);
    users[index] = deletedUser;

    return ok(deletedUser);
  },

  // Search users by name or email
  search_users: (query: string): User[] => {
    const lowercaseQuery = query.toLowerCase();
    return users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(lowercaseQuery) ||
        user.lastName.toLowerCase().includes(lowercaseQuery) ||
        user.email.toLowerCase().includes(lowercaseQuery)
    );
  },
};

// Functional programming helpers
export const createUserWorkflow = (request: CreateUserRequest) => user_service.create_user(request);

export const updateUserWorkflow = (request: UpdateUserRequest) => user_service.update_user(request);

// Composition example
export const initialiseNewUser = (data: CreateUserRequest) => createUserWorkflow(data);
