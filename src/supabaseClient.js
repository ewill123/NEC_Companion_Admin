import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
const { data, error } = await supabase
  .from("education_videos")
  .insert([{ title: "Video Title", url: "firebase_url_here" }]);
