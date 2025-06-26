"use client";

import Link from "next/link";
import { HelpCircle } from "lucide-react";

export default function FloatingHelp() {
  return (
    <Link
      href="/help"
      aria-label="Help Center"
      className="fixed right-6 top-20 z-50 rounded-full
                 bg-blue-600 p-4 shadow-lg transition-colors
                 hover:bg-blue-700 focus:outline-none
                 focus:ring-4 focus:ring-blue-300 group"
    >
      <HelpCircle className="h-6 w-6 text-white" />
      <span
        className="absolute right-16 top-1/2 -translate-y-1/2 scale-0
                   rounded bg-gray-800 px-2 py-1 text-xs text-white
                   transition-all group-hover:scale-100">
        Help
      </span>
    </Link>
  );
}
