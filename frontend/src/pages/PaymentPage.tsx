import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import type { Booking } from "../types";

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bid = Number(id);
    if (!id || Number.isNaN(bid)) {
      setLoading(false);
      return;
    }
    api
      .get<Booking[]>("/bookings/me")
      .then((r) => {
        const b = r.data.find((x) => x.id === bid);
        setBooking(b ?? null);
      })
      .catch(() => setBooking(null))
      .finally(() => setLoading(false));
  }, [id]);

  const pay = async () => {
    if (!booking) return;
    try {
      await api.post(`/bookings/${booking.id}/pay`);
      setDone(true);
      const { data } = await api.get<Booking[]>("/bookings/me");
      const b = data.find((x) => x.id === booking.id);
      if (b) setBooking(b);
    } catch {
      alert("Payment step failed.");
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="py-20 text-center text-slate-400">Loading…</div>
      </AppShell>
    );
  }

  if (!booking) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="text-slate-400">Booking not found.</p>
          <Link to="/dashboard" className="mt-4 inline-block text-teal-400 hover:underline">
            Back to dashboard
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
        <Link to="/dashboard" className="text-sm text-slate-500 hover:text-teal-400">
          ← Dashboard
        </Link>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center">
          {done || booking.payment_status === "paid" ? (
            <>
              <CheckCircle className="mx-auto h-14 w-14 text-teal-400" />
              <h1 className="mt-4 font-display text-xl font-semibold text-white">Payment recorded</h1>
              <p className="mt-2 text-sm text-slate-400">
                Show plate <strong className="text-white">{booking.registration_plate}</strong> at the gate for ANPR.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display text-xl font-semibold text-white">Checkout</h1>
              <p className="mt-4 text-sm text-slate-400">
                {booking.slot_label} · {booking.duration_hours}h · starts{" "}
                {new Date(booking.start_time).toLocaleString()}
              </p>
              <p className="mt-6 font-display text-3xl font-semibold text-teal-400">
                ₹{booking.total_price.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-slate-500">Demo: confirms payment in-app (no card gateway).</p>
              <button
                type="button"
                onClick={pay}
                className="mt-8 w-full rounded-xl bg-teal-500 py-3.5 text-sm font-semibold text-park-950 transition hover:bg-teal-400"
              >
                Pay now
              </button>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
