import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import type { AdminBookingRow, Slot, User } from "../types";

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<AdminBookingRow[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, u, s] = await Promise.all([
        api.get<AdminBookingRow[]>("/admin/bookings"),
        api.get<User[]>("/admin/users"),
        api.get<Slot[]>("/slots"),
      ]);
      setBookings(b.data);
      setUsers(u.data);
      setSlots(s.data);
    } catch {
      setBookings([]);
      setUsers([]);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSlot = async (slotId: number, is_enabled: boolean) => {
    try {
      await api.patch(`/admin/slots/${slotId}`, { is_enabled });
      await load();
    } catch {
      alert("Could not update slot.");
    }
  };

  const toggleSensor = async (slotId: number, sensor_occupied: boolean) => {
    try {
      await api.patch(`/admin/slots/${slotId}`, { sensor_occupied });
      await load();
    } catch {
      alert("Could not update sensor flag.");
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-white">Admin</h1>
            <p className="text-sm text-slate-400">Bookings, users, and slot management</p>
          </div>
          <Link
            to="/dashboard"
            className="text-sm text-teal-400 hover:underline"
          >
            User view
          </Link>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading…</p>
        ) : (
          <>
            <section className="mb-12">
              <h2 className="mb-4 font-display text-lg font-semibold text-white">Slots</h2>
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Label</th>
                      <th className="px-4 py-3">Enabled</th>
                      <th className="px-4 py-3">Sensor occupied</th>
                      <th className="px-4 py-3">Available (computed)</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {slots.map((s) => (
                      <tr key={s.id} className="bg-slate-950/30">
                        <td className="px-4 py-3 font-medium text-white">{s.label}</td>
                        <td className="px-4 py-3 text-slate-300">{s.is_enabled ? "Yes" : "No"}</td>
                        <td className="px-4 py-3 text-slate-300">{s.sensor_occupied ? "Yes" : "No"}</td>
                        <td className="px-4 py-3 text-teal-400/90">
                          {s.available_for_booking ? "Yes" : "No"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => toggleSlot(s.id, !s.is_enabled)}
                              className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-white hover:bg-slate-700"
                            >
                              Toggle enable
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleSensor(s.id, !s.sensor_occupied)}
                              className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-white hover:bg-slate-700"
                            >
                              Toggle sensor
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-4 font-display text-lg font-semibold text-white">All bookings</h2>
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Slot</th>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Plate</th>
                      <th className="px-4 py-3">Start</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {bookings.map((b) => (
                      <tr key={b.id} className="bg-slate-950/30">
                        <td className="px-4 py-3 text-white">{b.slot_label}</td>
                        <td className="px-4 py-3 text-slate-300">
                          {b.username}
                          <span className="block text-xs text-slate-500">{b.phone}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{b.registration_plate}</td>
                        <td className="px-4 py-3 text-slate-400">{new Date(b.start_time).toLocaleString()}</td>
                        <td className="px-4 py-3 text-slate-400">{b.duration_hours}h</td>
                        <td className="px-4 py-3 text-teal-400/90">₹{b.total_price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {b.status} / {b.payment_status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="mb-4 font-display text-lg font-semibold text-white">Registered users</h2>
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Username</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Online</th>
                      <th className="px-4 py-3">Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {users.map((u) => (
                      <tr key={u.id} className="bg-slate-950/30">
                        <td className="px-4 py-3 font-medium text-white">{u.username}</td>
                        <td className="px-4 py-3 text-slate-400">{u.phone}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              u.is_online ? "bg-teal-500/20 text-teal-300" : "bg-slate-800 text-slate-500"
                            }`}
                          >
                            {u.is_online ? "Online" : "Offline"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{u.is_admin ? "Yes" : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
