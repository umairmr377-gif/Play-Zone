  "use client";

  import { createBrowserClient } from "@supabase/ssr";
  import { Database } from "../supabaseClient";

  /**
   * Create Supabase client for client components
   * Returns null if Supabase is not configured (graceful degradation)
   */
  export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(`
  ⚠️ Supabase is not configured. Please set up your environment variables:

  1. Create a .env.local file in the project root
  2. Add your Supabase credentials:
    NEXT_PUBLIC_SUPABASE_URL=https://zpkojuhplrhweiznnnda.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpwa29qdWhwbHJod2Vpem5ubmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0ODUzOTcsImV4cCI6MjA3OTA2MTM5N30.rH381sTtakryT-vTgNn2iov9roNf2rVt6ca9MmIO5zg

  Get your credentials from: https://app.supabase.com → Project Settings → API

  See ENV_SETUP.md for detailed instructions.
      `.trim());
      return null;
    }

    // Check if using placeholder values
    if (supabaseUrl.includes("your-project") || supabaseUrl.includes("placeholder") || 
        supabaseAnonKey.includes("your-anon") || supabaseAnonKey.includes("placeholder")) {
      console.warn(`
  ⚠️ Supabase credentials are still using placeholder values.

  Please update .env.local with your actual Supabase credentials:
  - NEXT_PUBLIC_SUPABASE_URL https://zpkojuhplrhweiznnnda.supabase.co
  - NEXT_PUBLIC_SUPABASE_ANON_KEY eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpwa29qdWhwbHJod2Vpem5ubmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0ODUzOTcsImV4cCI6MjA3OTA2MTM5N30.rH381sTtakryT-vTgNn2iov9roNf2rVt6ca9MmIO5zg

  Get your credentials from: https://app.supabase.com → Project Settings → API
      `.trim());
      return null;
    }

    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  }

