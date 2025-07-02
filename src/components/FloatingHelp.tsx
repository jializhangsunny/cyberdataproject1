"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import HelpModal from "@/components/help/page";
export default function FloatingHelp() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* floating button */}
      <button
        aria-label="Help Center"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-6 z-50 rounded-full bg-blue-600 p-4
                   shadow-lg transition-colors hover:bg-blue-700
                   focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        <HelpCircle className="h-6 w-6 text-white" />
      </button>

      {/* modal */}
      {open && <HelpModal onClose={() => setOpen(false)} />}
    </>
  );
}