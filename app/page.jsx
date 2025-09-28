"use client";

import { useTheme } from "next-themes";
import React from "react";

export default function Home() {
  const { setTheme } = useTheme();

  return (
    <div className="p-4">
      <h2>Manisha</h2>
      <button className="mr-2 p-2 bg-blue-500 text-white rounded">Submit</button>
      <button
        className="mr-2 p-2 bg-gray-800 text-white rounded"
        onClick={() => setTheme("dark")}
      >
        Dark Mode
      </button>
      <button
        className="p-2 bg-yellow-300 text-black rounded"
        onClick={() => setTheme("light")}
      >
        Light Mode
      </button>
    </div>
  );
}
