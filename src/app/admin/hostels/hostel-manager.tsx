"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Room = { id: string; code: string; floor: number; capacity: number; isActive: boolean };
type Building = { id: string; code: string; name: string; rooms: Room[] };
type Hostel = { id: string; code: string; name: string; description: string | null; buildings: Building[] };

export function HostelManager({ canManage }: { canManage: boolean }) {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [hostelForm, setHostelForm] = useState({ code: "", name: "", description: "" });
  const [buildingForm, setBuildingForm] = useState({ hostelId: "", code: "", name: "" });
  const [roomForm, setRoomForm] = useState({ buildingId: "", code: "", floor: "0", capacity: "2" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/hostels", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load hostel inventory.");
      setHostels(data.hostels);
    } catch (err) { setError(err instanceof Error ? err.message : "Request failed."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function submit(path: string, payload: unknown) {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save changes.");
      setNotice("Saved successfully."); await load(); return true;
    } catch (err) { setError(err instanceof Error ? err.message : "Request failed."); return false; }
    finally { setBusy(false); }
  }

  const roomCount = hostels.reduce((sum, hostel) => sum + hostel.buildings.reduce((n, building) => n + building.rooms.length, 0), 0);
  const bedCount = hostels.reduce((sum, hostel) => sum + hostel.buildings.reduce((n, building) => n + building.rooms.filter((room) => room.isActive).reduce((m, room) => m + room.capacity, 0), 0), 0);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-8 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div><Link href="/" className="text-xs text-accent hover:text-white">← Dashboard</Link><p className="mt-4 text-xs uppercase tracking-[.2em] text-accent">Inventory management</p><h1 className="mt-2 text-3xl font-bold text-white">Hostels & rooms</h1><p className="mt-2 text-sm text-slate-400">Manage hostel blocks, buildings and bed capacity.</p></div>
        <div className="rounded-xl border border-line bg-panel px-4 py-3 text-right"><p className="text-xs text-slate-500">Inventory summary</p><p className="mt-1 text-sm font-semibold text-white">{hostels.length} hostels · {roomCount} rooms · {bedCount} beds</p></div>
      </header>

      {(error || notice) && <p role={error ? "alert" : "status"} className={`mt-5 rounded-xl border px-4 py-3 text-sm ${error ? "border-rose-400/30 bg-rose-400/5 text-rose-200" : "border-emerald-400/30 bg-emerald-400/5 text-emerald-200"}`}>{error || notice}</p>}

      {canManage && <section className="mt-7 grid gap-4 lg:grid-cols-3">
        <form className="space-y-3 rounded-2xl border border-line bg-panel p-5" onSubmit={async (event) => { event.preventDefault(); if (await submit("/api/admin/hostels", hostelForm)) setHostelForm({ code: "", name: "", description: "" }); }}>
          <h2 className="font-semibold text-white">Add hostel</h2>
          <input required maxLength={24} placeholder="Hostel code" value={hostelForm.code} onChange={(e) => setHostelForm({ ...hostelForm, code: e.target.value })} className="field" />
          <input required maxLength={100} placeholder="Hostel name" value={hostelForm.name} onChange={(e) => setHostelForm({ ...hostelForm, name: e.target.value })} className="field" />
          <input maxLength={500} placeholder="Description (optional)" value={hostelForm.description} onChange={(e) => setHostelForm({ ...hostelForm, description: e.target.value })} className="field" />
          <button disabled={busy} className="action">{busy ? "Saving…" : "Create hostel"}</button>
        </form>
        <form className="space-y-3 rounded-2xl border border-line bg-panel p-5" onSubmit={async (event) => { event.preventDefault(); if (await submit("/api/admin/buildings", buildingForm)) setBuildingForm({ ...buildingForm, code: "", name: "" }); }}>
          <h2 className="font-semibold text-white">Add building</h2>
          <select required value={buildingForm.hostelId} onChange={(e) => setBuildingForm({ ...buildingForm, hostelId: e.target.value })} className="field"><option value="">Select hostel</option>{hostels.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}</select>
          <input required placeholder="Building code" value={buildingForm.code} onChange={(e) => setBuildingForm({ ...buildingForm, code: e.target.value })} className="field" />
          <input required placeholder="Building name" value={buildingForm.name} onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })} className="field" />
          <button disabled={busy || hostels.length === 0} className="action">Create building</button>
        </form>
        <form className="space-y-3 rounded-2xl border border-line bg-panel p-5" onSubmit={async (event) => { event.preventDefault(); if (await submit("/api/admin/rooms", { ...roomForm, floor: Number(roomForm.floor), capacity: Number(roomForm.capacity) })) setRoomForm({ ...roomForm, code: "" }); }}>
          <h2 className="font-semibold text-white">Add room</h2>
          <select required value={roomForm.buildingId} onChange={(e) => setRoomForm({ ...roomForm, buildingId: e.target.value })} className="field"><option value="">Select building</option>{hostels.flatMap((h) => h.buildings.map((b) => <option key={b.id} value={b.id}>{h.code} / {b.name}</option>))}</select>
          <input required placeholder="Room code" value={roomForm.code} onChange={(e) => setRoomForm({ ...roomForm, code: e.target.value })} className="field" />
          <div className="grid grid-cols-2 gap-2"><input type="number" min="-2" max="100" placeholder="Floor" value={roomForm.floor} onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })} className="field" /><input required type="number" min="1" max="20" value={roomForm.capacity} onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })} className="field" /></div>
          <button disabled={busy || hostels.every((h) => h.buildings.length === 0)} className="action">Create room</button>
        </form>
      </section>}

      <section className="mt-8 rounded-2xl border border-line bg-panel/70 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-white">Inventory directory</h2><button onClick={() => void load()} className="text-xs text-accent hover:text-white">Refresh</button></div>
        {loading ? <p className="py-10 text-sm text-slate-400">Loading inventory…</p> : hostels.length === 0 ? <p className="py-10 text-sm text-slate-400">No active hostels yet. Add your first hostel above.</p> : <div className="mt-5 space-y-4">{hostels.map((hostel) => <article key={hostel.id} className="rounded-xl border border-line bg-black/10 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs font-mono text-accent">{hostel.code}</p><h3 className="mt-1 font-semibold text-white">{hostel.name}</h3>{hostel.description && <p className="mt-1 text-xs text-slate-500">{hostel.description}</p>}</div><span className="text-xs text-slate-400">{hostel.buildings.length} buildings</span></div><div className="mt-4 grid gap-3 md:grid-cols-2">{hostel.buildings.map((building) => <div key={building.id} className="rounded-lg border border-line/80 p-3"><p className="text-sm font-medium text-slate-200">{building.name} <span className="font-mono text-xs text-slate-500">({building.code})</span></p><div className="mt-2 flex flex-wrap gap-2">{building.rooms.map((room) => <span key={room.id} className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-slate-300">{room.code} · {room.capacity} beds · Floor {room.floor}</span>)}{building.rooms.length === 0 && <span className="text-xs text-slate-500">No rooms added</span>}</div></div>)}</div></article>)}</div>}
      </section>
      <style jsx>{`.field{width:100%;border:1px solid #263247;border-radius:10px;background:#080d18;padding:11px 12px;color:#edf2ff;font-size:13px;outline:none}.field:focus{border-color:#8b9cff}.action{width:100%;border-radius:10px;background:#8b9cff;padding:11px;color:#080d18;font-size:13px;font-weight:700}.action:disabled{opacity:.5;cursor:not-allowed}`}</style>
    </main>
  );
}
