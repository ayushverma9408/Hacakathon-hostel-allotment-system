import {
  Activity,
  ArrowUpRight,
  BedDouble,
  Building2,
  ClipboardList,
  FileSpreadsheet,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  Users
} from "lucide-react";

const navigation = [
  { label: "Overview", href: "#overview", icon: LayoutDashboard, active: true },
  { label: "Hostels & rooms", href: "#hostels", icon: Building2, active: false },
  { label: "Participants", href: "#participants", icon: Users, active: false },
  { label: "Allocation", href: "#allocation", icon: BedDouble, active: false },
  { label: "Reports", href: "#reports", icon: FileSpreadsheet, active: false }
];

const metrics = [
  { label: "Registered hostels", value: "—", note: "Database setup pending", icon: Building2 },
  { label: "Participants", value: "—", note: "No records imported", icon: Users },
  { label: "Available beds", value: "—", note: "Room inventory pending", icon: BedDouble },
  { label: "Allocation runs", value: "0", note: "No runs in this workspace", icon: Activity }
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-[11px] font-semibold uppercase tracking-[.22em] text-slate-500">{children}</p>;
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="border-b border-line bg-[#0b1220]/90 px-5 py-5 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-4">
        <a href="#overview" className="flex items-center gap-3 px-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent"><Building2 size={21} /></span>
          <span><span className="block text-sm font-bold tracking-wide text-white">ALLOTMENT<span className="text-accent">PRO</span></span><span className="text-[10px] uppercase tracking-[.2em] text-slate-500">Hostel operations</span></span>
        </a>

        <div className="mt-10 hidden lg:block"><SectionLabel>Workspace</SectionLabel></div>
        <nav aria-label="Main navigation" className="mt-6 flex gap-2 overflow-x-auto lg:mt-0 lg:flex-col">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <a key={item.label} href={item.href} className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${item.active ? "bg-accent/10 font-semibold text-accent ring-1 ring-accent/20" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
                <Icon size={17} />{item.label}
              </a>
            );
          })}
        </nav>

        <div className="mt-10 hidden lg:block"><SectionLabel>System</SectionLabel></div>
        <a href="#system-status" className="mt-6 hidden items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-white lg:flex">
          <Settings2 size={17} />Configuration
        </a>
        <div className="mt-10 hidden rounded-2xl border border-line bg-panel/80 p-4 lg:block">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-mint"><ShieldCheck size={15} /> DEVELOPMENT MODE</div>
          <p className="text-xs leading-5 text-slate-400">This workspace is being prepared. Database and sign-in will be connected in upcoming phases.</p>
        </div>
        <p className="mt-8 hidden px-2 text-[10px] text-slate-600 lg:block">ALLOTMENTPRO · FOUNDATION BUILD</p>
      </aside>

      <section id="overview" className="min-w-0 px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[.2em] text-accent">Admin workspace / Overview</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">Hostel operations</h1>
            <p className="mt-2 text-sm text-slate-400">A clear view of your hostel inventory and allocation workflow.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-xs font-medium text-amber-200">
            <span className="h-2 w-2 rounded-full bg-amber-300" /> Foundation mode
          </div>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <article key={metric.label} className="rounded-2xl border border-line bg-panel/75 p-5 shadow-glow">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">{metric.label}</span>
                  <span className="rounded-lg bg-white/5 p-2 text-accent"><Icon size={17} /></span>
                </div>
                <p className="mt-5 text-3xl font-semibold tracking-tight text-white">{metric.value}</p>
                <p className="mt-2 text-xs text-slate-500">{metric.note}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
          <article className="rounded-2xl border border-line bg-panel/70 p-5 sm:p-6">
            <SectionLabel>Getting started</SectionLabel>
            <h2 className="text-lg font-semibold text-white">Build your allocation workspace</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">The new application shell is ready. The next phases will connect persistent data, administrator access, hostel inventory, and the allocation engine.</p>
            <div className="mt-6 space-y-3">
              {[
                ["01", "Application foundation", "Next.js, TypeScript and dashboard shell", "Complete"],
                ["02", "Database & data model", "PostgreSQL and Prisma integration", "Next phase"],
                ["03", "Authentication & roles", "Secure admin and staff access", "Planned"],
                ["04", "Hostel and participant data", "Import, validation and management", "Planned"]
              ].map(([number, title, description, status]) => (
                <div key={number} className="flex items-start gap-4 rounded-xl border border-line/80 bg-black/10 p-4">
                  <span className="pt-0.5 font-mono text-xs text-accent">{number}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-200">{title}</p>
                    <p className="mt-1 text-xs text-slate-500">{description}</p>
                  </div>
                  <span className={`whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider ${status === "Complete" ? "text-mint" : "text-slate-500"}`}>{status}</span>
                </div>
              ))}
            </div>
          </article>

          <div className="space-y-5">
            <article id="system-status" className="rounded-2xl border border-line bg-panel/70 p-5">
              <SectionLabel>System status</SectionLabel>
              <div className="space-y-4">
                {[
                  ["Web application", "Ready", "text-mint"],
                  ["Database", "Not connected", "text-amber-200"],
                  ["Authentication", "Not configured", "text-slate-500"],
                  ["Allocation API", "Not configured", "text-slate-500"]
                ].map(([label, value, color]) => (
                  <div key={label} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-400">{label}</span><span className={`text-xs font-medium ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </article>

            <article id="allocation" className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/10 to-transparent p-5">
              <div className="flex items-center gap-2 text-accent"><ClipboardList size={17} /><span className="text-xs font-semibold uppercase tracking-wider">Next milestone</span></div>
              <h2 className="mt-4 text-lg font-semibold text-white">Persistent data layer</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Create the PostgreSQL schema for hostels, rooms, participants, users and allocation runs.</p>
              <a href="#system-status" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-white">View system status <ArrowUpRight size={15} /></a>
            </article>
          </div>
        </div>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 text-xs text-slate-600">
          <span>AllotmentPro · Full-stack migration</span>
          <span>Phase 3 · Application foundation</span>
        </footer>
      </section>
    </main>
  );
}
