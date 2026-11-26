import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { resilientSupabaseFetch } from "./localFallback";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://local.karmapath.invalid";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.local";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: resilientSupabaseFetch,
  },
});
