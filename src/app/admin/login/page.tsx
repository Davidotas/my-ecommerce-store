import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs tracking-[0.3em] uppercase text-white/20 text-center mb-3">
          Admin
        </p>
        <h1 className="text-2xl font-light text-white text-center mb-10">
          Sign in
        </h1>

        <form action={login} className="space-y-4">
          <input
            name="password"
            type="password"
            placeholder="Password"
            autoFocus
            className="w-full bg-transparent border border-white/10 text-white text-sm px-4 py-3.5 placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
          />
          {error && (
            <p className="text-xs text-red-400/70 tracking-wide">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-white text-black text-xs tracking-[0.2em] uppercase font-medium py-4 hover:bg-[#e8e8e8] transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
