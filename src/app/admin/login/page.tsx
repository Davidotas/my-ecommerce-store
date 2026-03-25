import { login } from "./actions";
import PasswordInput from "./PasswordInput";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mykolo-logo.png" alt="MyKolo Mysibi" style={{ height: "48px", width: "auto" }} />
        </div>
        <p className="text-xs tracking-[0.3em] uppercase text-white/20 text-center mb-3">
          Admin
        </p>
        <h1 className="text-2xl font-light text-white text-center mb-10">
          Sign in
        </h1>

        <form action={login} className="space-y-4">
          <PasswordInput />
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
