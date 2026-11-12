"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Session = { id: string; code: string; name: string; status: string };
type Room = { roomCode: string; capacity: number; occupied: number; vacant: number; occupancyPercent: number };
type Building = { code: string; name: string; rooms: Room[] };
type Hostel = { code: string; name: string; capacity: number; occupied: number; vacant: number; occupancyPercent: number; buildings: Building[] };
type Report = {
  session: { id: string; code: string; name: string; status: string };
  run: { id: string; algorithmVersion: string; completedAt: string | null } | null;
  summary: { assigned: number; waitlisted: number; bedCapacity: number; vacantBeds: number; occupancyPercent: number };
  hostels: Hostel[];
};

export function ReportCenter({ sessions, canExport }: { sessions: Session[]; canExport: boolean }) {
  const [sessionId, setSessionId] = useState(sessions[0]?.id ?? "");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) { setReport(null); return; }
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch(`/api/admin/reports?sessionId=${encodeURIComponent(sessionId)}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load reports.");
        return data as Report;
      })
      .then((data) => { if (!cancelled) setReport(data); })
      .catch((err: unknown) => { if (!cancelled) setError(err instanceof Error ? err.message : "Could not load reports."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [sessionId]);

  const exportUrl = (type: "allocations" | "waitlist") =>
    `/api/admin/reports/export?sessionId=${encodeURIComponent(sessionId)}&type=${type}`;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div><Link href="/" className="text-xs text-accent hover:text-white">← Dashboard</Link><p className="mt-4 text-xs uppercase tracking-[.2em] text-accent">Operations intelligence</p><h1 className="mt-2 text-3xl font-bold text-white">Reports & analytics</h1><p className="mt-2 text-sm text-slate-400">Occupancy and allocation reports from completed database runs.</p></div>
        <button onClick={() => window.print()} className="action print:hidden">Print report</button>
      </header>

      <section className="mt-7 rounded-2xl border border-line bg-panel p-5 print:hidden">
        <label className="block max-w-xl text-xs text-slate-400">Academic session
          <select value={sessionId} onChange={(event) => setSessionId(event.target.value)} className="field mt-2 w-full">
            <option value="">Select session</option>
            {sessions.map((session) => <option key={session.id} value={session.id}>{session.code} — {session.name} ({session.status.toLowerCase()})</option>)}
          </select>
        </label>
        {report?.run && canExport && <div className="mt-4 flex flex-wrap gap-3">
          <a className="action" href={exportUrl("allocations")}>Download allocation CSV</a>
          <a className="action" href={exportUrl("waitlist")}>Download waitlist CSV</a>
        </div>}
      </section>

      {loading && <p className="mt-6 text-sm text-slate-400">Loading report…</p>}
      {error && <p role="alert" className="mt-6 rounded-xl border border-rose-400/30 bg-rose-400/5 px-4 py-3 text-sm text-rose-200">{error}</p>}
      {!loading && !error && !sessionId && <p className="mt-6 text-sm text-slate-400">No academic sessions are available yet.</p>}
      {!loading && report && <div className="mt-7 space-y-6" id="print-report">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs uppercase tracking-wider text-slate-500">Selected session</p><h2 className="mt-1 text-xl font-semibold text-white">{report.session.code} — {report.session.name}</h2></div><p className="text-xs text-slate-500">{report.run?.completedAt ? `Run completed ${new Date(report.run.completedAt).toLocaleString()}` : "No completed allocation run"}</p></div>
        {report.run ? <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {[
              ["Assigned", report.summary.assigned],
              ["Waitlisted", report.summary.waitlisted],
              ["Bed capacity", report.summary.bedCapacity],
              ["Vacant beds", report.summary.vacantBeds],
              ["Occupancy", `${report.summary.occupancyPercent}%`]
            ].map(([label, value]) => <article key={label} className="rounded-xl border border-line bg-panel p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p></article>)}
          </div>
          <section className="rounded-2xl border border-line bg-panel p-5">
            <h2 className="text-lg font-semibold text-white">Hostel occupancy</h2>
            {report.hostels.length === 0 ? <p className="mt-4 text-sm text-slate-500">No active hostel rooms are configured.</p> : <div className="mt-4 space-y-5">
              {report.hostels.map((hostel) => <div key={hostel.code} className="border-b border-line/70 pb-4 last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold text-slate-100">{hostel.name} <span className="font-mono text-xs text-slate-500">({hostel.code})</span></h3><p className="text-sm text-slate-300">{hostel.occupied} / {hostel.capacity} beds · {hostel.occupancyPercent}%</p></div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, hostel.occupancyPercent)}%` }} /></div>
                {hostel.buildings.map((building) => <div key={building.code} className="mt-4"><h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{building.name}</h4><div className="mt-2 overflow-x-auto"><table className="w-full min-w-[420px] text-left text-sm"><thead className="text-xs text-slate-500"><tr><th className="py-2">Room</th><th>Capacity</th><th>Occupied</th><th>Vacant</th><th>Occupancy</th></tr></thead><tbody>{building.rooms.map((room) => <tr key={room.roomCode} className="border-t border-line/60"><td className="py-2 text-slate-200">{room.roomCode}</td><td className="text-slate-400">{room.capacity}</td><td className="text-slate-300">{room.occupied}</td><td className="text-slate-300">{room.vacant}</td><td className="text-slate-300">{room.occupancyPercent}%</td></tr>)}</tbody></table></div></div>)}
              </div>)}
            </div>}
          </section>
        </> : <div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5"><h2 className="font-semibold text-amber-100">No completed allocation run</h2><p className="mt-2 text-sm text-slate-400">This session has no committed allocation yet. Occupancy reports and exports become available after an administrator completes an allocation run.</p></div>}
      </div>}
      <style jsx global>{`@media print { body { background: white !important; color: black !important; } main { max-width: none !important; padding: 0 !important; } #print-report, #print-report * { color: black !important; border-color: #ccc !important; } #print-report article, #print-report section { background: white !important; box-shadow: none !important; } }`}</style>
    </main>
  );
}
