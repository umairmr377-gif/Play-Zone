/**
 * Create first admin user for Local Auth
 * 
 * Usage:
 *   npx tsx scripts/create-admin-user.ts <email> <password> <fullName>
 * 
 * Example:
 *   npx tsx scripts/create-admin-user.ts admin@example.com password123 "Admin User"
 */

import { localSignUp, localUpdateUserRole } from "../lib/auth/local-auth";

async function createAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];
  const fullName = process.argv[4] || "Admin User";

  if (!email || !password) {
    console.error("Usage: npx tsx scripts/create-admin-user.ts <email> <password> [fullName]");
    process.exit(1);
  }

  try {
    console.log(`Creating admin user: ${email}...`);
    
    // Create user
    const { user } = await localSignUp(email, password, fullName);
    
    // Promote to admin
    await localUpdateUserRole(user.id, "admin");
    
    console.log("✅ Admin user created successfully!");
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.full_name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user.id}`);
  } catch (error: any) {
    if (error.message.includes("already exists")) {
      console.error("❌ User already exists. Use a different email.");
    } else {
      console.error("❌ Error creating admin user:", error.message);
    }
    process.exit(1);
  }
}

createAdmin();

