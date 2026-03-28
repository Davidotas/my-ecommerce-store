"use client";

import { useState, FormEvent } from "react";
import { updateOrderTracking } from "../actions";

type Props = {
  orderId: string;
  initialTrackingNumber?: string | null;
  initialCarrier?: string | null;
  initialEstimatedDelivery?: string | null;
};

const CARRIERS = [
  "Royal Mail",
  "DHL",
  "FedEx",
  "UPS",
  "Evri / Hermes",
  "Other",
];

export default function TrackingForm({
  orderId,
  initialTrackingNumber,
  initialCarrier,
  initialEstimatedDelivery,
}: Props) {
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber ?? "");
  const [carrier, setCarrier] = useState(initialCarrier ?? "");
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    initialEstimatedDelivery
      ? new Date(initialEstimatedDelivery).toISOString().split("T")[0]
      : ""
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      await updateOrderTracking(orderId, {
        trackingNumber,
        carrier,
        estimatedDelivery,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save tracking info. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">
          Tracking Number
        </label>
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="e.g. JD000123456789"
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-gray-400 transition-colors"
        />
      </div>

      <div>
        <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">
          Carrier
        </label>
        <select
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-gray-400 transition-colors bg-white"
        >
          <option value="">Select carrier…</option>
          {CARRIERS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">
          Estimated Delivery
        </label>
        <input
          type="date"
          value={estimatedDelivery}
          onChange={(e) => setEstimatedDelivery(e.target.value)}
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-gray-400 transition-colors"
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-gray-900 text-white text-xs font-semibold py-2.5 rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save Tracking Info"}
      </button>
    </form>
  );
}
