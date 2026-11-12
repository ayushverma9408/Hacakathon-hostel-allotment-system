"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Actor = { id: string; name: string; role: string };
type Event = {
  id: string; action: string; entityType: string; entityId: string;
  metadata: Record<string, unknown> | null; createdAt: string;
  actor: { id: string; name: string; email: string; role: string } | null;
};
type Result = { events: Event[]; actors: Actor[]; pagination: { page: number; limit: number; total: number; pages: number } };

export function AuditExplorer() {
  const [result, setResult] = useState<Result | null>(null);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [actorId, setActorId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), limit: "25" });
    if (action.trim()) params.set("action", action.trim());
    if (entityType.trim()) params.set("entityType", entityType.trim());
    if (actorId) params.set("actorId", actorId);
    if (from) params.set("from", new Date(from).toISOString());
    if (to) params.set("to", new Date(to).toISOString());
    try {
      const response = await fetch(`/api/admin/audit-events?${params}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load audit events.");
      setResult(data as Result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load audit events.");
    } finally {
      setLoading(false);
    }
  }, [page, action, entityType, actorId, from, to]);

  useEffect(() => { void load(); }, [load]);

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    void load();
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 sm:px-8">
      <header className="border-b border-line pb-6">
        <Link href="/" className="text-xs text-accent hover:text-white">← Dashboard</Link>
        <p className="mt-4 text-xs uppercase tracking-[.2em] text-accent">Security & accountability</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Audit trail</h1>
        <p className="mt-2 text-sm text-slate-400">Review administrative changes and allocation activity. Visible to administrators only.</p>
      </header>

      <form onSubmit={applyFilters} className="mt-7 grid gap-3 rounded-2xl border border-line bg-panel p-5 sm:grid-cols-2 xl:grid-cols-5">
        <label className="text-xs text-slate-400">Action contains<input value={action} onChange={(e) => setAction(e.target.value)} placeholder="e.g. PARTICIPANT" className="field mt-2 w-full" /></label>
        <label className="text-xs text-slate-400">Entity type<input value={entityType} onChange={(e) => setEntityType(e.target.value)} placeholder="Participant, Hostel…" className="field mt-2 w-full" /></label>
        <label className="text-xs text-slate-400">Performed by<select value={actorId} onChange={(e) => setActorId(e.target.value)} className="field mt-2 w-full"><option value="">All administrators</option>{result?.actors.map((actor) => <option key={actor.id} value={actor.id}>{actor.name} ({actor.role})</option>)}</select></label>
        <label className="text-xs text-slate-400">From<input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} className="field mt-2 w-full" /></label>
        <label className="text-xs text-slate-400">To<input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} className="field mt-2 w-full" /></label>
        <div className="flex items-end gap-2 sm:col-span-2 xl:col-span-5"><button className="action" type="submit">Apply filters</button><button className="action-secondary" type="button" onClick={() => { setAction(""); setEntityType(""); setActorId(""); setFrom(""); setTo(""); setPage(1); }}>Clear filters</button></div>
      </form>

      {error && <p role="alert" className="mt-5 rounded-xl border border-rose-400/30 bg-rose-400/5 px-4 py-3 text-sm text-rose-200">{error}</p>}
      <section className="mt-6 overflow-hidden rounded-2xl border border-line bg-panel">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4"><h2 className="font-semibold text-white">Recorded events</h2><p className="text-xs text-slate-500">{result?.pagination.total ?? 0} total events</p></div>
        {loading && <p className="px-5 py-6 text-sm text-slate-400">Loading audit trail…</p>}
        {!loading && result?.events.length === 0 && <p className="px-5 py-8 text-sm text-slate-500">No events match these filters.</p>}
        {!loading && result && result.events.length > 0 && <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-black/10 text-xs text-slate-500"><tr><th className="px-5 py-3">Timestamp</th><th className="px-5 py-3">Actor</th><th className="px-5 py-3">Action</th><th className="px-5 py-3">Entity</th><th className="px-5 py-3">Details</th></tr></thead><tbody>{result.events.map((item) => <tr key={item.id} className="border-t border-line/70 align-top"><td className="whitespace-nowrap px-5 py-4 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</td><td className="px-5 py-4"><p className="text-slate-200">{item.actor?.name ?? "Deleted user"}</p><p className="mt-1 text-xs text-slate-500">{item.actor?.role ?? "—"}</p></td><td className="px-5 py-4"><span className="rounded-md bg-accent/10 px-2 py-1 font-mono text-xs text-accent">{item.action}</span></td><td className="px-5 py-4"><p className="text-slate-200">{item.entityType}</p><p className="mt-1 max-w-[180px] truncate font-mono text-[10px] text-slate-500" title={item.entityId}>{item.entityId}</p></td><td className="max-w-sm px-5 py-4"><pre className="whitespace-pre-wrap break-words text-xs text-slate-400">{item.metadata ? JSON.stringify(item.metadata, null, 2) : "—"}</pre></td></tr>)}</tbody></table></div>}
        <div className="flex items-center justify-between border-t border-line px-5 py-4"><p className="text-xs text-slate-500">Page {result?.pagination.page ?? page} of {Math.max(1, result?.pagination.pages ?? 1)}</p><div className="flex gap-2"><button className="action-secondary" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button><button className="action-secondary" disabled={!result || page >= result.pagination.pages || loading} onClick={() => setPage((value) => value + 1)}>Next</button></div></div>
      </section>
    </main>
  );
}
