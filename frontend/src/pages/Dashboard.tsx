import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Car, CheckCircle2, MapPin, RefreshCw, XCircle } from "lucide-react";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import type { Booking, Slot } from "../types";

export default function Dashboard() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, b] = await Promise.all([
        api.get<Slot[]>("/slots"),
        api.get<Booking[]>("/bookings/me"),
      ]);
      setSlots(s.data);
      setBookings(b.data);
    } catch {
      setSlots([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const available = slots.filter((s) => s.available_for_booking).length;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">Your dashboard</h1>
            <p className="mt-1 text-sm text-slate-400">Live bay status and your reservations</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-200 transition hover:border-slate-600"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              to="/book"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-semibold text-park-950 shadow-lg shadow-teal-500/20 transition hover:bg-teal-400"
            >
              <Car className="h-4 w-4" />
              Reserve a spot
            </Link>
          </div>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Available now</p>
            <p className="mt-2 font-display text-3xl font-semibold text-teal-400">{available}</p>
            <p className="text-xs text-slate-500">of {slots.length} bays</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Your bookings</p>
            <p className="mt-2 font-display text-3xl font-semibold text-white">{bookings.length}</p>
            <p className="text-xs text-slate-500">total records</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Hardware</p>
            <p className="mt-2 text-sm text-slate-400">
              IR + ANPR hooks are exposed on the API for ESP32 integration.
            </p>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="mb-4 font-display text-lg font-semibold text-white">Parking grid</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:grid-cols-5">
            {slots.map((s) => (
              <div
                key={s.id}
                className={`rounded-xl border p-4 text-center transition ${
                  !s.is_enabled
                    ? "border-slate-800 bg-slate-950/50 opacity-60"
                    : s.available_for_booking
                      ? "border-teal-500/40 bg-teal-950/20"
                      : "border-slate-700 bg-slate-900/60"
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-sm font-semibold text-white">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  {s.label}
                </div>
                <div className="mt-2 flex justify-center">
                  {s.available_for_booking ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Free
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                      <XCircle className="h-3.5 w-3.5" /> Busy
                    </span>
                  )}
                </div>
                {s.sensor_occupied && (
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-amber-500/90">Sensor</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 font-display text-lg font-semibold text-white">Recent reservations</h2>
          {bookings.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-700 py-12 text-center text-sm text-slate-500">
              No bookings yet. Reserve a spot to see it here.
            </p>
          ) : (
            <ul className="space-y-3">
              {bookings.slice(0, 8).map((b) => (
                <li
                  key={b.id}
                  className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-white">
                      {b.slot_label} · {b.registration_plate}
                    </p>
                    <p className="text-xs text-slate-500">
                      {b.vehicle_make} · {new Date(b.start_time).toLocaleString()} · {b.duration_hours}h
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-teal-400">₹{b.total_price.toFixed(2)}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        b.payment_status === "paid" ? "bg-teal-500/20 text-teal-300" : "bg-amber-500/15 text-amber-300"
                      }`}
                    >
                      {b.payment_status}
                    </span>
                    {b.payment_status === "pending" && (
                      <Link
                        to={`/payment/${b.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
                      >
                        <CalendarClock className="h-3.5 w-3.5" />
                        Pay
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
