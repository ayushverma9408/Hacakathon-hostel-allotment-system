import { redirect } from "next/navigation";
import { Building2, ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { loginAction } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (session?.user) redirect("/");

  const params = await searchParams;
  const hasError = params.error === "invalid";

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <section className="w-full max-w-md rounded-3xl border border-line bg-panel/90 p-7 shadow-glow sm:p-9">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/15 text-accent">
            <Building2 size={24} />
          </span>
          <div>
            <p className="text-sm font-bold tracking-wide text-white">
              ALLOTMENT<span className="text-accent">PRO</span>
            </p>
            <p className="text-[10px] uppercase tracking-[.2em] text-slate-500">
              Hostel operations
            </p>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-accent">
            <ShieldCheck size={15} /> Secure workspace
          </div>
          <h1 className="mt-3 text-2xl font-bold text-white">Sign in</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Use the account issued by your system administrator.
          </p>
        </div>

        {hasError && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm text-rose-200"
          >
            Sign-in failed. Check your details or contact your administrator.
          </p>
        )}

        <form action={loginAction} className="mt-7 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-xs font-medium text-slate-300">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              maxLength={254}
              className="w-full rounded-xl border border-line bg-[#080d18] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-accent"
              placeholder="admin@example.edu"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-xs font-medium text-slate-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={14}
              maxLength={128}
              className="w-full rounded-xl border border-line bg-[#080d18] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-accent"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-[#080d18] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel"
          >
            Sign in to workspace
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          Accounts are provisioned by an administrator. Public registration is disabled.
        </p>
      </section>
    </main>
  );
}
