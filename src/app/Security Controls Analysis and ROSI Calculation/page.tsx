"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";


// Organization Vulnerabilities (Vo) (internal)
const INTERNAL_VULNERABILITIES = [
  {
    id: "CVE-2017-0144",
    cvss: 8.1,
    system: "Microsoft Windows",
    status: "Active",
  },
  {
    id: "CVE-2017-5638",
    cvss: 9.8,
    system: "Apache Struts 2 Framework",
    status: "Patched",
  },
  {
    id: "CVE-2018-11776",
    cvss: 9.8,
    system: "Apache Struts",
    status: "In Progress",
  },
];

// Threat Actor Known Exploits (Vt) (external)
const EXTERNAL_EXPLOITS = [
  { id: "CVE-2017-0144", pattern: "SMB Remote Code Execution" },
  { id: "CVE-2017-5638", pattern: "Remote Code Execution" },
  { id: "CVE-2021-44228", pattern: "Remote Code Execution" },
];

// VL options
const VL_OPTIONS = [
  { label: "Very Low", value: 0 },
  { label: "Low", value: 0.2 },
  { label: "Moderate", value: 0.5 },
  { label: "High", value: 0.8 },
  { label: "Very High", value: 1 },
];



export default function SecurityControlsAnalysis() {
    const searchParams = useSearchParams();
 const tefValue = parseFloat(searchParams.get("tefValue") || "0");

  const [vlValues, setVlValues] = useState<{ [key: string]: number }>({});
  const [isGuideVisible, setIsGuideVisible] = useState(false);


  // Get common vulnerabilities (Vtn = Vo ∩ Vt)
  const commonVulnerabilities = INTERNAL_VULNERABILITIES.filter((v) =>
    EXTERNAL_EXPLOITS.some((e) => e.id === v.id)
  ).map((v) => ({
    ...v,
    pattern: EXTERNAL_EXPLOITS.find((e) => e.id === v.id)?.pattern || "",
  }));

  // Calculate LEF Value and Total LEF
  const calculateLEF = (vl: number) => vl * tefValue;
  const totalLEF =
    Object.values(vlValues).reduce((acc, vl) => acc + calculateLEF(vl), 0) / 2;

  // Handle VL change
  const handleVLChange = (id: string, value: number) => {
    setVlValues({ ...vlValues, [id]: value });
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar Navigation */}
      <div className="w-1/4 bg-gray-800 p-6">
        <h2 className="text-2xl font-bold mb-4">Navigation</h2>
        <nav className="flex flex-col space-y-4">
          <Link
            href="/"
            className="p-3 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
          >
            Threat Actor Analysis
          </Link>
          <Link
            href="/riskanalysis"
            className="p-3 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
          >
            Risk Analysis
          </Link>
          <Link
            href="/vulnerabilityanalysis"
            className="p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Vulnerability Analysis
          </Link>
           <Link
          href="/Security Controls Analysis and ROSI Calculation"
          className="p-3 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
        >
          Security Controls Analysis and ROSI Calculation
        </Link>
        </nav>
      </div>

      {/* VL Assessment Reference Guide Modal */}
      {isGuideVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-800 p-6 rounded-md max-w-lg">
            <h2 className="text-xl font-semibold mb-4">
              VL Assessment Reference Guide
            </h2>
            <ul className="list-disc space-y-2 pl-4">
              <li>VL = 1: CVSS ≥ 9 and status is Active</li>
              <li>VL = 0.8: CVSS 7-8.9 and status is Active</li>
              <li>VL = 0.5: CVSS 4-6.9 or higher score but In Progress</li>
              <li>VL = 0.2: CVSS &lt; 4 or mitigation measures are in place</li>
              <li>VL = 0: Patched vulnerability</li>
            </ul>
            <button
              onClick={() => setIsGuideVisible(false)}
              className="mt-4 p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
