/**
 * Local Authentication System
 * Works when Supabase is not configured
 * Stores users in data/local-users.json
 * Uses Next.js cookies for session management
 */

import { cookies } from "next/headers";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const USERS_FILE = path.join(process.cwd(), "data", "local-users.json");
const SESSION_COOKIE_NAME = "local-auth-session";
const SESSION_SECRET = process.env.SESSION_SECRET || "local-dev-secret-change-in-production";

export interface LocalUser {
  id: string;
  email: string;
  full_name: string;
  password_hash: string; // Hashed password
  role: "user" | "admin";
  created_at: string;
}

export interface LocalSession {
  userId: string;
  email: string;
  role: "user" | "admin";
  expiresAt: number;
}

/**
 * Hash password using SHA-256 (simple, for local dev)
 * In production, use bcrypt
 */
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + SESSION_SECRET).digest("hex");
}

/**
 * Generate session token
 */
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Read users from file
 */
async function readUsers(): Promise<LocalUser[]> {
  try {
    const data = await fs.readFile(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist, return empty array
    return [];
  }
}

/**
 * Write users to file
 */
async function writeUsers(users: LocalUser[]): Promise<void> {
  // Ensure data directory exists
  const dataDir = path.dirname(USERS_FILE);
  await fs.mkdir(dataDir, { recursive: true });
  
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

/**
 * Get current session from cookies
 */
export async function getLocalSession(): Promise<LocalSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    
    if (!sessionToken) {
      return null;
    }

    // In a real implementation, you'd verify the token signature
    // For now, we'll store session data in a separate file or use JWT
    // Simplified: decode token (in production, use proper JWT)
    const sessionsFile = path.join(process.cwd(), "data", "local-sessions.json");
    
    try {
      const sessionsData = await fs.readFile(sessionsFile, "utf-8");
      const sessions: Record<string, LocalSession> = JSON.parse(sessionsData);
      const session = sessions[sessionToken];
      
      if (!session || session.expiresAt < Date.now()) {
        return null;
      }
      
      return session;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

/**
 * Save session to file and cookie
 */
async function saveSession(session: LocalSession, sessionToken: string): Promise<void> {
  const sessionsFile = path.join(process.cwd(), "data", "local-sessions.json");
  const dataDir = path.dirname(sessionsFile);
  await fs.mkdir(dataDir, { recursive: true });
  
  let sessions: Record<string, LocalSession> = {};
  try {
    const data = await fs.readFile(sessionsFile, "utf-8");
    sessions = JSON.parse(data);
  } catch {
    // File doesn't exist, start fresh
  }
  
  sessions[sessionToken] = session;
  
  // Clean up expired sessions
  const now = Date.now();
  Object.keys(sessions).forEach((token) => {
    if (sessions[token].expiresAt < now) {
      delete sessions[token];
    }
  });
  
  await fs.writeFile(sessionsFile, JSON.stringify(sessions, null, 2), "utf-8");
  
  // Set cookie (this will be done in the route handler)
}

/**
 * Sign up a new user (local auth)
 */
export async function localSignUp(
  email: string,
  password: string,
  fullName: string
): Promise<{ user: LocalUser; sessionToken: string }> {
  const users = await readUsers();
  
  // Check if user already exists
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("User with this email already exists");
  }
  
  // Create new user
  const newUser: LocalUser = {
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    full_name: fullName,
    password_hash: hashPassword(password),
    role: "user", // Default role
    created_at: new Date().toISOString(),
  };
  
  users.push(newUser);
  await writeUsers(users);
  
  // Create session
  const sessionToken = generateSessionToken();
  const session: LocalSession = {
    userId: newUser.id,
    email: newUser.email,
    role: newUser.role,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  
  await saveSession(session, sessionToken);
  
  return { user: newUser, sessionToken };
}

/**
 * Sign in a user (local auth)
 */
export async function localSignIn(
  email: string,
  password: string
): Promise<{ user: LocalUser; sessionToken: string }> {
  const users = await readUsers();
  const emailLower = email.toLowerCase();
  
  const user = users.find((u) => u.email === emailLower);
  
  if (!user) {
    throw new Error("Invalid email or password");
  }
  
  const passwordHash = hashPassword(password);
  if (user.password_hash !== passwordHash) {
    throw new Error("Invalid email or password");
  }
  
  // Create session
  const sessionToken = generateSessionToken();
  const session: LocalSession = {
    userId: user.id,
    email: user.email,
    role: user.role,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  
  await saveSession(session, sessionToken);
  
  return { user, sessionToken };
}

/**
 * Get current user from session (local auth)
 */
export async function localGetUser(): Promise<LocalUser | null> {
  const session = await getLocalSession();
  
  if (!session) {
    return null;
  }
  
  const users = await readUsers();
  const user = users.find((u) => u.id === session.userId);
  
  return user || null;
}

/**
 * Sign out (local auth)
 */
export async function localSignOut(sessionToken: string): Promise<void> {
  const sessionsFile = path.join(process.cwd(), "data", "local-sessions.json");
  
  try {
    const sessionsData = await fs.readFile(sessionsFile, "utf-8");
    const sessions: Record<string, LocalSession> = JSON.parse(sessionsData);
    delete sessions[sessionToken];
    await fs.writeFile(sessionsFile, JSON.stringify(sessions, null, 2), "utf-8");
  } catch {
    // File doesn't exist, nothing to do
  }
}

/**
 * Update user role (admin only, local auth)
 */
export async function localUpdateUserRole(
  userId: string,
  role: "user" | "admin"
): Promise<LocalUser> {
  const users = await readUsers();
  const user = users.find((u) => u.id === userId);
  
  if (!user) {
    throw new Error("User not found");
  }
  
  user.role = role;
  await writeUsers(users);
  
  return user;
}

/**
 * Get all users (admin only, local auth)
 */
export async function localGetAllUsers(): Promise<LocalUser[]> {
  return await readUsers();
}

