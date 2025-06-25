/* --------------------------------------------- */
/*  src/app/help/page.tsx  (EN version)          */
/* --------------------------------------------- */
"use client";

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

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-10 px-6">
      {/* ---------- header ---------- */}
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold mb-2">
          Threat Actor Dashboard – User Journey
        </h1>
        <p className="text-gray-400">
          Follow the steps below to move from <strong>threat identification</strong> to
          <strong> investment decision-making</strong>.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 rounded bg-blue-600 px-4 py-2 text-sm
                     font-medium transition-colors hover:bg-blue-700"
        >
          Back to Dashboard
        </Link>
      </header>

      {/* ---------- journey map ---------- */}
      <ol className="mx-auto max-w-4xl space-y-8">
        {steps.map(({ id, title, icon: Icon, desc }) => (
          <li
            key={id}
            className="relative flex gap-4 rounded-lg bg-gray-800/80 p-5 shadow"
          >
            <span className="flex h-10 w-10 shrink-0 items-center
                             justify-center rounded-full bg-blue-600 text-lg
                             font-bold">
              {id}
            </span>

            <div className="flex flex-col">
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
  );
}
