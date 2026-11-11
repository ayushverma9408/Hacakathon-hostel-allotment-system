import { signOut } from "@/auth";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        type="submit"
        className="rounded-xl border border-line px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-accent/50 hover:text-white"
      >
        Sign out
      </button>
    </form>
  );
}
