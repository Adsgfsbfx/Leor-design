import "server-only";

import { createClient } from "@supabase/supabase-js";

export class SupabaseConfigurationError extends Error {
  constructor() {
    super("Supabase server credentials are not configured.");
    this.name = "SupabaseConfigurationError";
  }
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

function createSupabaseAdmin() {
  const url = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    throw new SupabaseConfigurationError();
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

let supabaseAdmin: ReturnType<typeof createSupabaseAdmin> | undefined;

export function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createSupabaseAdmin();
  }
  return supabaseAdmin;
}
