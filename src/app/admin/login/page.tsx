import { login } from "./actions";
import PasswordInput from "./PasswordInput";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    // Fixed overlay so this covers the admin sidebar on the login screen
    <div className="fixed inset-0 z-50 bg-[#f5f5f5] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mykolo-logo.png" alt="Logo" style={{ height: "40px", width: "auto" }} />
        </div>

        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gray-400 mb-1.5">Admin Portal</p>
          <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
        </div>

        <form action={login} className="space-y-4">
          <PasswordInput />

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
              {error === "invalid" ? "Incorrect password. Please try again." : error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-gray-900 text-white text-sm font-medium py-3 rounded hover:bg-black transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
