import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Call in Server Components / Route Handlers to get a session-aware Supabase client. */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component — cookies can't be set here, middleware handles it
          }
        },
      },
    }
  );
}

/** Get the currently authenticated user in a Server Component (returns null if not logged in). */
export async function getServerUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
