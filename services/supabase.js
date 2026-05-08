import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zhznnuoowxfbqkwrvutt.supabase.co";
const supabaseKey = "sb_publishable_ihoRX0sf8b--VKV63VsrsA_ogWNS6uD";

export const supabase = createClient(supabaseUrl, supabaseKey);