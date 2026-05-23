import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import type { Slot } from "../types";

export default function BookingPage() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotId, setSlotId] = useState<number | "">("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [plate, setPlate] = useState("");
  const [startLocal, setStartLocal] = useState("");
  const [hours, setHours] = useState("2");
  const [quote, setQuote] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get<Slot[]>("/slots").then((r) => {
      setSlots(r.data);
      const first = r.data.find((s) => s.available_for_booking && s.is_enabled);
      if (first) setSlotId(first.id);
    });
  }, []);

  const startIso = () => {
    if (!startLocal) return null;
    const d = new Date(startLocal);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  };

  const getQuote = async () => {
    const iso = startIso();
    if (!slotId || !iso || !vehicleMake.trim() || !plate.trim()) {
      alert("Select slot, date/time, vehicle make, and plate.");
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post<{ estimated_price: number }>("/bookings/quote", {
        slot_id: slotId,
        vehicle_make: vehicleMake.trim(),
        registration_plate: plate.trim(),
        start_time: iso,
        duration_hours: Number(hours),
      });
      setQuote(data.estimated_price);
    } catch {
      alert("Could not get quote. Check inputs and slot availability.");
      setQuote(null);
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    const iso = startIso();
    if (!slotId || !iso) return;
    setBusy(true);
    try {
      const { data } = await api.post<{ id: number }>("/bookings", {
        slot_id: slotId,
        vehicle_make: vehicleMake.trim(),
        registration_plate: plate.trim().toUpperCase(),
        start_time: iso,
        duration_hours: Number(hours),
      });
      navigate(`/payment/${data.id}`);
    } catch (e: unknown) {
      const msg =
        typeof e === "object" && e !== null && "response" in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null;
      alert(msg || "Booking failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <Link to="/dashboard" className="text-sm text-slate-500 hover:text-teal-400">
          ← Dashboard
        </Link>
        <h1 className="mt-4 font-display text-2xl font-semibold text-white">Reserve a bay</h1>
        <p className="text-sm text-slate-400">Vehicle details, slot, start time & duration</p>

        <div className="mt-8 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Parking slot</span>
            <select
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-3 text-sm text-white outline-none focus:border-teal-500/50"
              value={slotId === "" ? "" : String(slotId)}
              onChange={(e) => setSlotId(e.target.value ? Number(e.target.value) : "")}
            >
              {slots.map((s) => (
                <option key={s.id} value={s.id} disabled={!s.is_enabled}>
                  {s.label}
                  {!s.is_enabled ? " (disabled)" : !s.available_for_booking ? " (busy now)" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Vehicle make</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-3 text-sm text-white outline-none focus:border-teal-500/50"
              value={vehicleMake}
              onChange={(e) => setVehicleMake(e.target.value)}
              placeholder="e.g. Hyundai Creta"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Registration number</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-3 text-sm text-white outline-none focus:border-teal-500/50"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder="For ANPR match"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Start date & time</span>
            <input
              type="datetime-local"
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-3 text-sm text-white outline-none focus:border-teal-500/50"
              value={startLocal}
              onChange={(e) => setStartLocal(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Hours</span>
            <input
              type="number"
              min={0.5}
              max={168}
              step={0.5}
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-3 text-sm text-white outline-none focus:border-teal-500/50"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </label>

          {quote !== null && (
            <div className="rounded-xl border border-teal-500/30 bg-teal-950/20 px-4 py-3 text-center">
              <p className="text-xs text-slate-400">Estimated total</p>
              <p className="font-display text-2xl font-semibold text-teal-400">₹{quote.toFixed(2)}</p>
              <p className="text-[11px] text-slate-500">Peak hours use a higher rate on the server</p>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={busy}
              onClick={getQuote}
              className="flex-1 rounded-xl border border-slate-600 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800/80 disabled:opacity-50"
            >
              Show price
            </button>
            <button
              type="button"
              disabled={busy || quote === null}
              onClick={confirm}
              className="flex-1 rounded-xl bg-teal-500 py-3 text-sm font-semibold text-park-950 transition hover:bg-teal-400 disabled:opacity-50"
            >
              Confirm booking
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
