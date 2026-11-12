"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Session = { id: string; code: string; name: string };
type Participant = { id: string; registrationNo: string; fullName: string; email: string | null; department: string | null; academicYear: number | null; status: "ACTIVE" | "INACTIVE"; sessionId: string; session: { code: string; name: string } };
type PageData = { participants: Participant[]; pagination: { page: number; pages: number; total: number } };
const blank = { registrationNo: "", fullName: "", email: "", department: "", academicYear: "1" };

export function ParticipantManager({ canManage }: { canManage: boolean }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [csv, setCsv] = useState("");
  const [fileName, setFileName] = useState("");
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

  const loadParticipants = useCallback(async () => {
    if (!sessionId) { setParticipants([]); setLoading(false); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "25", q: query, sessionId });
      const response = await fetch(`/api/admin/participants?${params}`, { cache: "no-store" });
      const data = await response.json() as PageData & { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not load participants.");
      setParticipants(data.participants); setPages(Math.max(1, data.pagination.pages)); setTotal(data.pagination.total);
    } catch (err) { setError(err instanceof Error ? err.message : "Request failed."); }
    finally { setLoading(false); }
  }, [page, query, sessionId]);

  useEffect(() => { void loadSessions().catch((err) => setError(err instanceof Error ? err.message : "Could not load sessions.")); }, [loadSessions]);
  useEffect(() => { void loadParticipants(); }, [loadParticipants]);

  async function send(path: string, method: string, payload?: unknown) {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(path, { method, headers: { "Content-Type": "application/json" }, ...(payload ? { body: JSON.stringify(payload) } : {}) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed.");
      setNotice("Changes saved."); await loadParticipants(); return data;
    } catch (err) { setError(err instanceof Error ? err.message : "Request failed."); return null; }
    finally { setBusy(false); }
  }

  function startEdit(person: Participant) {
    setEditing(person.id);
    setForm({ registrationNo: person.registrationNo, fullName: person.fullName, email: person.email || "", department: person.department || "", academicYear: String(person.academicYear || "") });
  }

  async function submitParticipant(event: FormEvent) {
    event.preventDefault();
    const payload = { fullName: form.fullName, email: form.email, department: form.department, academicYear: form.academicYear ? Number(form.academicYear) : null, ...(editing ? {} : { registrationNo: form.registrationNo, sessionId }) };
    const result = await send(editing ? `/api/admin/participants/${editing}` : "/api/admin/participants", editing ? "PATCH" : "POST", payload);
    if (result) { setForm(blank); setEditing(null); }
  }

  async function readFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("CSV file must be 2 MB or smaller."); return; }
    setFileName(file.name); setCsv(await file.text());
  }

  async function importCsv() {
    const result = await send("/api/admin/participants/import", "POST", { sessionId, csv });
    if (result) { setNotice(`Imported ${result.inserted} participants; skipped ${result.skipped} rows.`); setCsv(""); setFileName(""); await loadParticipants(); }
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6"><div><Link href="/" className="text-xs text-accent hover:text-white">← Dashboard</Link><p className="mt-4 text-xs uppercase tracking-[.2em] text-accent">Student records</p><h1 className="mt-2 text-3xl font-bold text-white">Participants</h1><p className="mt-2 text-sm text-slate-400">Register, search, update and import participant records.</p></div><div className="rounded-xl border border-line bg-panel px-4 py-3"><p className="text-xs text-slate-500">Directory count</p><p className="mt-1 text-lg font-semibold text-white">{total.toLocaleString()} records</p></div></header>
      {(error || notice) && <p role={error ? "alert" : "status"} className={`mt-5 rounded-xl border px-4 py-3 text-sm ${error ? "border-rose-400/30 bg-rose-400/5 text-rose-200" : "border-emerald-400/30 bg-emerald-400/5 text-emerald-200"}`}>{error || notice}</p>}
      <div className="mt-6 flex flex-wrap items-center gap-3"><label className="text-xs text-slate-400" htmlFor="session">Academic session</label><select id="session" value={sessionId} onChange={(e) => { setPage(1); setSessionId(e.target.value); }} className="field min-w-64">{sessions.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}</select>{sessions.length === 0 && <span className="text-xs text-amber-300">No active academic session. Run the synthetic seed or activate a session first.</span>}</div>
      {canManage && <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <form onSubmit={submitParticipant} className="space-y-3 rounded-2xl border border-line bg-panel p-5"><h2 className="font-semibold text-white">{editing ? "Edit participant" : "Add participant"}</h2>{!editing && <input required placeholder="Registration number" value={form.registrationNo} onChange={(e) => setForm({ ...form, registrationNo: e.target.value })} className="field" />}<input required placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="field" /><input type="email" placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="field" /><div className="grid grid-cols-2 gap-2"><input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="field" /><input type="number" min="1" max="10" placeholder="Academic year" value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} className="field" /></div><div className="flex gap-2"><button disabled={busy || !sessionId} className="action">{editing ? "Save changes" : "Register participant"}</button>{editing && <button type="button" onClick={() => { setEditing(null); setForm(blank); }} className="cancel">Cancel</button>}</div></form>
        <div className="space-y-3 rounded-2xl border border-line bg-panel p-5"><h2 className="font-semibold text-white">Import CSV</h2><p className="text-xs leading-5 text-slate-400">Required columns: registrationNo, fullName. Optional: email, department, academicYear. Existing registration numbers are skipped.</p><input type="file" accept=".csv,text/csv" onChange={readFile} className="block w-full text-xs text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:text-white" />{fileName && <p className="text-xs text-slate-300">Selected: {fileName}</p>}<button disabled={busy || !csv || !sessionId} onClick={() => void importCsv()} className="action">Validate & import CSV</button><a className="text-xs text-accent hover:text-white" href="data:text/csv;charset=utf-8,registrationNo%2CfullName%2Cemail%2Cdepartment%2CacademicYear%0ADEMO-REG-003%2CSample%20Participant%20Three%2C%2CComputer%20Science%2C2" download="participants-template.csv">Download CSV template</a></div>
      </section>}
      <section className="mt-8 rounded-2xl border border-line bg-panel/70 p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-white">Participant directory</h2><input value={query} onChange={(e) => { setPage(1); setQuery(e.target.value); }} placeholder="Search name, registration or email" className="field max-w-sm" /></div>
        {loading ? <p className="py-10 text-sm text-slate-400">Loading participants…</p> : participants.length === 0 ? <p className="py-10 text-sm text-slate-400">No participant records match this view.</p> : <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-slate-500"><tr><th className="pb-3">Registration</th><th className="pb-3">Name</th><th className="pb-3">Department</th><th className="pb-3">Year</th><th className="pb-3">Status</th>{canManage && <th className="pb-3">Actions</th>}</tr></thead><tbody>{participants.map((person) => <tr key={person.id} className="border-t border-line/70"><td className="py-3 font-mono text-xs text-accent">{person.registrationNo}</td><td className="py-3"><p className="text-slate-200">{person.fullName}</p><p className="text-xs text-slate-500">{person.email || "No email"}</p></td><td className="py-3 text-slate-400">{person.department || "—"}</td><td className="py-3 text-slate-400">{person.academicYear ?? "—"}</td><td className="py-3"><span className={person.status === "ACTIVE" ? "text-emerald-300" : "text-slate-500"}>{person.status}</span></td>{canManage && <td className="py-3"><div className="flex gap-3"><button onClick={() => startEdit(person)} className="text-xs text-accent hover:text-white">Edit</button>{person.status === "ACTIVE" && <button disabled={busy} onClick={() => { if (window.confirm(`Deactivate ${person.registrationNo}?`)) void send(`/api/admin/participants/${person.id}`, "DELETE"); }} className="text-xs text-rose-300 hover:text-rose-200">Deactivate</button>}</div></td>}</tr>)}</tbody></table></div>}
        <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-xs text-slate-400"><span>Page {page} of {pages}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="cancel">Previous</button><button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="cancel">Next</button></div></div>
      </section>
      <style jsx>{`.field{border:1px solid #263247;border-radius:10px;background:#080d18;padding:11px 12px;color:#edf2ff;font-size:13px;outline:none}.field:focus{border-color:#8b9cff}.action{flex:1;border-radius:10px;background:#8b9cff;padding:11px;color:#080d18;font-size:13px;font-weight:700}.action:disabled{opacity:.5;cursor:not-allowed}.cancel{border:1px solid #263247;border-radius:9px;padding:9px 12px;color:#cbd5e1;font-size:12px}.cancel:disabled{opacity:.4;cursor:not-allowed}`}</style>
    </main>
  );
}
