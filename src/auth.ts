import { createClient, SupabaseClient, Session } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export const signUp = async (email: string, password: string): Promise<any> => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data.user;
};

export const signIn = async (
  email: string,
  password: string
): Promise<Session | null> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.session;
};

export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const registerUser = async (
  email: string,
  password: string
): Promise<any> => {
  // Additional registration actions can go here if needed.
  return await signUp(email, password);
};
