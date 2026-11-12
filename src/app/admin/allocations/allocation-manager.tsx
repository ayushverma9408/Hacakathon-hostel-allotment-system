"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Session = { id: string; code: string; name: string };
type Assignment = { participantId: string; registrationNo: string; fullName: string; roomId: string; roomCode: string; buildingName: string; hostelName: string; bedNumber: number };
type WaitlistEntry = { participantId: string; registrationNo: string; fullName: string; position: number; reason: string };
type Plan = { session: Session; algorithmVersion: string; statistics: { participants: number; rooms: number; bedCapacity: number; assigned: number; waitlisted: number; unfilledBeds: number; occupancyPercent: number }; assignments: Assignment[]; waitlist: WaitlistEntry[]; note: string };
type Run = { id: string; status: string; algorithmVersion: string; startedAt: string; completedAt: string | null; createdBy: { name: string } | null; _count: { allocations: number; waitlistEntries: number } };

export function AllocationManager({ canCommit }: { canCommit: boolean }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadSessions = useCallback(async () => {
    const response = await fetch("/api/admin/sessions", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load academic sessions.");
    setSessions(data.sessions);
    if (!sessionId && data.sessions[0]) setSessionId(data.sessions[0].id);
  }, [sessionId]);

  const loadRuns = useCallback(async () => {
    if (!sessionId) { setRuns([]); return; }
    const response = await fetch(`/api/admin/allocations?sessionId=${encodeURIComponent(sessionId)}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load allocation history.");
    setRuns(data.runs);
  }, [sessionId]);

  useEffect(() => { void loadSessions().catch((err) => setError(err instanceof Error ? err.message : "Could not load sessions.")); }, [loadSessions]);
  useEffect(() => { setPlan(null); setError(""); void loadRuns().catch((err) => setError(err instanceof Error ? err.message : "Could not load allocation history.")); }, [loadRuns]);

  async function preview() {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/allocations/preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not generate allocation preview.");
      setPlan(data); setNotice("Preview generated. No allocation records have been committed.");
    } catch (err) { setPlan(null); setError(err instanceof Error ? err.message : "Preview failed."); }
    finally { setBusy(false); }
  }

  async function commit() {
    if (!plan || !canCommit) return;
    if (!window.confirm(`Commit ${plan.statistics.assigned} bed assignments and ${plan.statistics.waitlisted} waitlist entries for ${plan.session.code}? This action cannot currently be undone.`)) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/allocations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not commit allocation.");
      setNotice(`Allocation run ${data.run.id} completed: ${data.statistics.assigned} assigned, ${data.statistics.waitlisted} waitlisted.`);
      setPlan(null);
      await loadRuns();
    } catch (err) { setError(err instanceof Error ? err.message : "Commit failed."); }
    finally { setBusy(false); }
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6"><div><Link href="/" className="text-xs text-accent hover:text-white">← Dashboard</Link><p className="mt-4 text-xs uppercase tracking-[.2em] text-accent">Allocation control centre</p><h1 className="mt-2 text-3xl font-bold text-white">Room allocation</h1><p className="mt-2 text-sm text-slate-400">Preview a deterministic FIFO allocation before an administrator commits it.</p></div><span className="rounded-xl border border-line bg-panel px-4 py-3 text-xs text-slate-400">Algorithm <strong className="ml-1 text-accent">fifo-v1</strong></span></header>
      {(error || notice) && <p role={error ? "alert" : "status"} className={`mt-5 rounded-xl border px-4 py-3 text-sm ${error ? "border-rose-400/30 bg-rose-400/5 text-rose-200" : "border-emerald-400/30 bg-emerald-400/5 text-emerald-200"}`}>{error || notice}</p>}
      <section className="mt-7 rounded-2xl border border-line bg-panel p-5 sm:p-6"><div className="flex flex-wrap items-end gap-3"><label className="min-w-64 flex-1 text-xs text-slate-400">Active academic session<select value={sessionId} onChange={(e) => setSessionId(e.target.value)} className="field mt-2 w-full"><option value="">Select session</option>{sessions.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}</select></label><button disabled={busy || !sessionId} onClick={() => void preview()} className="action">{busy ? "Working…" : "Generate preview"}</button></div>{sessions.length === 0 && <p className="mt-3 text-xs text-amber-300">No active academic session found. Activate a session before allocation.</p>}<p className="mt-4 text-xs leading-5 text-slate-500">Order: earliest participant registration first, then registration number. Beds are traversed by hostel, building and room code. No unconfigured personal attributes are used as allocation criteria.</p></section>

      {plan && <section className="mt-7 space-y-5"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{[["Participants",plan.statistics.participants],["Bed capacity",plan.statistics.bedCapacity],["Assigned",plan.statistics.assigned],["Waitlisted",plan.statistics.waitlisted],["Occupancy",`${plan.statistics.occupancyPercent}%`]].map(([label,value]) => <article key={label} className="rounded-xl border border-line bg-panel p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p></article>)}</div>
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-white">Preview results</h2><p className="mt-1 text-xs text-slate-500">{plan.note}</p></div>{canCommit ? <button disabled={busy || runs.some((run) => run.status === "COMPLETED")} onClick={() => void commit()} className="action max-w-xs">{busy ? "Committing…" : "Commit allocation"}</button> : <span className="text-xs text-amber-300">Read-only: administrator approval required to commit.</span>}</div>
        <div className="overflow-x-auto rounded-2xl border border-line bg-panel p-5"><h3 className="font-semibold text-white">Proposed bed assignments ({plan.assignments.length})</h3>{plan.assignments.length ? <table className="mt-4 w-full min-w-[650px] text-left text-sm"><thead className="text-xs text-slate-500"><tr><th className="pb-3">Registration</th><th className="pb-3">Participant</th><th className="pb-3">Hostel / building</th><th className="pb-3">Room</th><th className="pb-3">Bed</th></tr></thead><tbody>{plan.assignments.map((item) => <tr key={item.participantId} className="border-t border-line/70"><td className="py-3 font-mono text-xs text-accent">{item.registrationNo}</td><td className="py-3 text-slate-200">{item.fullName}</td><td className="py-3 text-slate-400">{item.hostelName} / {item.buildingName}</td><td className="py-3 text-slate-300">{item.roomCode}</td><td className="py-3 text-slate-300">{item.bedNumber}</td></tr>)}</tbody></table> : <p className="py-5 text-sm text-slate-500">No assignments can be made with the current inventory.</p>}</div>
        <div className="overflow-x-auto rounded-2xl border border-line bg-panel p-5"><h3 className="font-semibold text-white">Waitlist ({plan.waitlist.length})</h3>{plan.waitlist.length ? <table className="mt-4 w-full min-w-[520px] text-left text-sm"><thead className="text-xs text-slate-500"><tr><th className="pb-3">Position</th><th className="pb-3">Registration</th><th className="pb-3">Participant</th><th className="pb-3">Reason</th></tr></thead><tbody>{plan.waitlist.map((item) => <tr key={item.participantId} className="border-t border-line/70"><td className="py-3 text-slate-300">{item.position}</td><td className="py-3 font-mono text-xs text-accent">{item.registrationNo}</td><td className="py-3 text-slate-200">{item.fullName}</td><td className="py-3 text-slate-400">{item.reason}</td></tr>)}</tbody></table> : <p className="py-5 text-sm text-slate-500">Everyone fits within the configured bed capacity.</p>}</div>
      </section>}

      <section className="mt-8 rounded-2xl border border-line bg-panel/70 p-5 sm:p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-white">Allocation history</h2><button onClick={() => void loadRuns()} className="text-xs text-accent hover:text-white">Refresh</button></div>{runs.length === 0 ? <p className="py-8 text-sm text-slate-500">No allocation runs recorded for this session.</p> : <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[580px] text-left text-sm"><thead className="text-xs text-slate-500"><tr><th className="pb-3">Run</th><th className="pb-3">Status</th><th className="pb-3">Algorithm</th><th className="pb-3">Assigned</th><th className="pb-3">Waitlisted</th><th className="pb-3">Created</th></tr></thead><tbody>{runs.map((run) => <tr key={run.id} className="border-t border-line/70"><td className="py-3 font-mono text-xs text-slate-400">{run.id.slice(0, 12)}…</td><td className="py-3 text-emerald-300">{run.status}</td><td className="py-3 text-slate-300">{run.algorithmVersion}</td><td className="py-3 text-slate-300">{run._count.allocations}</td><td className="py-3 text-slate-300">{run._count.waitlistEntries}</td><td className="py-3 text-slate-400">{new Date(run.startedAt).toLocaleString()}</td></tr>)}</tbody></table></div>}</section>
      <style jsx>{`.field{border:1px solid #263247;border-radius:10px;background:#080d18;padding:11px 12px;color:#edf2ff;font-size:13px;outline:none}.field:focus{border-color:#8b9cff}.action{border-radius:10px;background:#8b9cff;padding:11px 18px;color:#080d18;font-size:13px;font-weight:700}.action:disabled{opacity:.5;cursor:not-allowed}`}</style>
    </main>
  );
}
