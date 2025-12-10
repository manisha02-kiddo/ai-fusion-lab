"use client";

import React from "react";

export default function UsageCreditProgress({ remainingToken = 0 }) {
  const total = 7; // ✅ MATCH Arcjet
  const used = Math.max(0, total - Number(remainingToken || 0));
  const pct = Math.round((used / total) * 100);

  return (
    <div className="p-3 border rounded-2xl mb-5">
      <h2 className="font-bold text-xl">Free Plan</h2>

      <p className="text-gray-400">
        {used}/{total} messages used
      </p>

      <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full mt-2 overflow-hidden">
        <div
          className="h-full bg-blue-600"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Resets every 12 hours
      </p>
    </div>
  );
}
