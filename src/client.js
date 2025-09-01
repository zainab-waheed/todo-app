// src/client.js
import { createClient } from "@supabase/supabase-js";

// 👇 apna Supabase project ka URL aur public anon key yahan paste karo
const supabaseUrl = "https://bogtmvgjwutnbaaexlkv.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZ3Rtdmdqd3V0bmJhYWV4bGt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MzM3MDgsImV4cCI6MjA3MjMwOTcwOH0.OySX7KFCg7D8WBH3uoWuZvyDKNhKXFHkwKuYfw5ujdU";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;   // 👈 default export
