import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdminClient(url: string, serviceKey: string) {
  return createClient(url, serviceKey);
}
