/* --------------------------------------------- */
/*  src/app/help/page.tsx  (EN version)          */
/* --------------------------------------------- */
"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  LogIn,
  SlidersHorizontal,
  ShieldCheck,
  BarChart3,
  Bug,
  AlertTriangle,
  Settings,
  DollarSign,
  FileUp,
  MessageSquare,
} from "lucide-react";

const steps = [
  { id: 1, title: "Log In",                         icon: LogIn,
    desc: "Log in with email / password to access the dashboard." },
  { id: 2, title: "Select Threat Actors",           icon: ShieldCheck,
    desc: "Choose one or more relevant threat actors from the dropdown." },
    { id: 3, title: "Select Company Info",            icon: SlidersHorizontal,
    desc: "Confirm your organization’s location and industry—these drive the matching rules." },
  { id: 4, title: "Review TA Ability & Match",      icon: BarChart3,
    desc: "Inspect the threat-ability gauge and the Location / Sector match indicators." },
  { id: 5, title: "Review TEF Value",               icon: AlertTriangle,
    desc: "Sort by TEF to spotlight the most urgent threat actors." },
  { id: 6, title: "Vulnerability Analysis",         icon: Bug,
    desc: "Check Vulnerability associated with the threats" },
  { id: 7, title: "Risk Analysis",                  icon: BarChart3,
    desc: "Enter asset-loss values to calculate total business risk in money." },
  { id: 8, title: "Security Controls Analysis",     icon: Settings,
    desc: "Review control coverage and choose proposed mitigations." },
  { id: 9, title: "ROSI Calculation",               icon: DollarSign,
    desc: "Compare mitigation cost with reduced risk to compute ROSI." },
  { id:10, title: "Export Report & Share",          icon: FileUp,
    desc: "Export the anaylsis and share it with management or clients." },
  { id:11, title: "Provide Feedback",               icon: MessageSquare,
    desc: "Send suggestions to keep improving the model." },
];

interface HelpModalProps {
  onClose: () => void;
}
export default function HelpModal({ onClose }: HelpModalProps) {
  //  ⟹ close on Esc
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  //  ⟹ render into <body> with a portal
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* card */}
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto
                      rounded-lg bg-blue-800 p-8 shadow-xl">
        {/* close × */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-300 hover:text-white"
        >
          ✕
        </button>

        {/* header */}
        <h1 className="mb-2 text-white text-2xl font-extrabold text-center">
          Threat Actor Dashboard – User Journey
        </h1>
        <p className="mb-8 text-center text-gray-400">
          Follow these steps to move from <b>threat identification</b> to
          <b> investment decision-making</b>.
        </p>

        {/* journey list */}
        <ol className="space-y-6">
          {steps.map(({ id, title, icon: Icon, desc }) => (
            <li key={id} className="flex text-white gap-4 rounded-lg bg-gray-800/80 p-5">
              <span className="flex h-10 w-10 items-center justify-center
                               rounded-full bg-blue-600 font-bold">
                {id}
              </span>
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Icon className="h-5 w-5 text-blue-400" />
                  <h2 className="text-lg font-semibold">{title}</h2>
                </div>
                <p className="text-sm text-gray-300">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>,
    document.body,
  );
}