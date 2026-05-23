import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Camera, Radio, ShieldCheck, Timer } from "lucide-react";
import api from "../api/axios";
import type { Slot } from "../types";

export default function Landing() {
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    api
      .get<Slot[]>("/slots/public")
      .then((r) => setSlots(r.data))
      .catch(() => setSlots([]));
  }, []);

  const free = slots.filter((s) => s.available_for_booking).length;

  return (
    <div className="min-h-screen bg-park-950 text-slate-100">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(20,184,166,0.12),transparent)]"
        aria-hidden
      />

      <header className="relative z-10 border-b border-slate-800/60 bg-park-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="font-display text-lg font-semibold tracking-tight text-white">CampusPark</span>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:text-white"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-park-950 shadow-lg shadow-teal-500/20 transition hover:bg-teal-400"
            >
              Sign up
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-24">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-teal-400/90">
          IoT · ANPR · EXSEL
        </p>
        <h1 className="mx-auto max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
          Smart campus parking with live slots & plate verification
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-400">
          Pre-book a bay, arrive at the gate, and let ANPR match your plate to your booking—while IR
          sensors keep slot occupancy accurate in real time.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/signup"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-park-950 shadow-xl transition hover:bg-slate-100 sm:w-auto"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-900/40 px-8 py-3.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 sm:w-auto"
          >
            I have an account
          </Link>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur">
            <div className="text-2xl font-semibold tabular-nums text-white">{slots.length || "10"}</div>
            <div className="text-xs text-slate-500">Total bays</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur">
            <div className="text-2xl font-semibold tabular-nums text-teal-400">{free}</div>
            <div className="text-xs text-slate-500">Available now</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur">
            <div className="text-2xl font-semibold tabular-nums text-white">ANPR</div>
            <div className="text-xs text-slate-500">Gate check</div>
          </div>
        </div>
      </section>

      <section className="relative border-t border-slate-800/80 bg-slate-900/30 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-3 sm:px-6">
          <div className="rounded-2xl border border-slate-800/80 bg-park-950/60 p-6">
            <Radio className="mb-3 h-8 w-8 text-teal-400" />
            <h2 className="font-display text-lg font-semibold text-white">IR occupancy</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Each slot reports presence to the cloud API—ready for ESP32 / sensor payloads over HTTP.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800/80 bg-park-950/60 p-6">
            <Camera className="mb-3 h-8 w-8 text-teal-400" />
            <h2 className="font-display text-lg font-semibold text-white">ANPR at entry</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Plate images from ESP32-CAM pair with your booking record for automated gate decisions.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800/80 bg-park-950/60 p-6">
            <Timer className="mb-3 h-8 w-8 text-teal-400" />
            <h2 className="font-display text-lg font-semibold text-white">Demand-aware pricing</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Peak windows apply a configurable multiplier before you confirm—transparent totals at checkout.
            </p>
          </div>
        </div>
      </section>

      <section className="relative py-16">
        <div className="mx-auto max-w-2xl rounded-2xl border border-teal-500/25 bg-gradient-to-br from-teal-950/40 to-slate-900/60 px-8 py-12 text-center">
          <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-teal-400" />
          <h2 className="font-display text-xl font-semibold text-white">Ready to park smarter?</h2>
          <p className="mt-2 text-sm text-slate-400">Create an account to view live bays and reserve your slot.</p>
          <Link
            to="/signup"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-sm font-semibold text-park-950 transition hover:bg-teal-400"
          >
            Sign up free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-600">
        EXSEL Design-Build-Operate · Smart Parking System
      </footer>
    </div>
  );
}
