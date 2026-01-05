const SUPABASE_URL = "https://ksyofflresajlpgitqhh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_x3xePs-MPJHSMbFu3Hcnsg_t1Kim4tg";

export const sb = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
