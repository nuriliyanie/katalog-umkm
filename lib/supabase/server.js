import { createClient } from "@supabase/supabase-js";

export function createServerClient() {
  const rawUrl = process.env.SUPABASE_URL;
  const supabaseUrl = rawUrl
    ? rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "")
    : "";
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_SECRET_KEY belum diatur di environment variable."
    );
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export default createServerClient;

