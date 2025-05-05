"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

// Asset Information
const ASSET = {
  id: 1,
  name: "Personal data storage system",
  value: 230, // in million $
};

// Vulnerabilities
const VULNERABILITIES = [
  { id: "CVE-2017-0144", cvss: 8.1 },
  { id: "CVE-2017-5638", cvss: 9.8 },
];

// Loss Types
const LOSS_TYPES = [
  { name: "Reputation Loss", amount: 280 },
  { name: "Regulatory Penalties", amount: 7.5 },
  { name: "Business Disruption", amount: 12.5 },
  { name: "Customer Loss", amount: 400 },
];

export default function RiskAnalysis() {
  const [selectedLosses, setSelectedLosses] = useState<string[]>([]);
  const [totalLEF, setTotalLEF] = useState(1); // Default Total LEF value = 1

  // Calculate CVSS average score
  const criticality =
    (VULNERABILITIES[0].cvss + VULNERABILITIES[1].cvss) / 2;

  // Calculate PLM (Primary Loss Magnitude)
  const plm = ASSET.value * criticality;
  const totalPLM = plm;

  // Handle checkbox change
  const handleLossChange = (lossName: string) => {
    setSelectedLosses((prev) =>
      prev.includes(lossName)
        ? prev.filter((item) => item !== lossName)
        : [...prev, lossName]
    );
  };

  // Calculate Total SLM (Secondary Loss Magnitude)
  const totalSLM = selectedLosses.reduce((acc, lossName) => {
    const loss = LOSS_TYPES.find((l) => l.name === lossName);
    return acc + (loss ? loss.amount : 0);
  }, 0);

  // Calculate Total Risk
  const totalRisk = totalLEF * totalPLM + totalSLM;

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
            className="p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Risk Analysis
          </Link>
          <Link
            href="/vulnerabilityanalysis"
            className="p-3 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
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

      {/* Main Content */}
      <div className="w-3/4 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Risk Analysis</h1>

        {/* Primary Loss Magnitude (PLM) Analysis */}
        <Card className="p-6 mb-8 bg-white">
          <h2 className="text-xl font-semibold mb-4">Primary Loss Magnitude (PLM) Analysis</h2>
          <div className="space-y-2">
            <p>
              <strong>Asset ID:</strong> {ASSET.id}
            </p>
            <p>
              <strong>Asset Name:</strong> {ASSET.name}
            </p>
            <p>
              <strong>Asset Value ($million):</strong> {ASSET.value}
            </p>
            <p>
              <strong>Affected by Vulnerability 1 (ID):</strong> {VULNERABILITIES[0].id}, CVSS: {VULNERABILITIES[0].cvss}
            </p>
            <p>
              <strong>Affected by Vulnerability 2 (ID):</strong> {VULNERABILITIES[1].id}, CVSS: {VULNERABILITIES[1].cvss}
            </p>
            <p>
              <strong>Criticality (average CVSS score):</strong> {criticality.toFixed(2)}
            </p>
            <p className="text-green-500 font-bold">
              PLM = Asset Value × Criticality = {ASSET.value} × {criticality.toFixed(2)} = {totalPLM.toFixed(2)} ($million)
            </p>
          </div>
        </Card>

        {/* Secondary Loss Magnitude (SLM) Analysis */}
        <Card className="p-6 mb-8 bg-white">
          <h2 className="text-xl font-semibold mb-4">Secondary Loss Magnitude (SLM) Analysis</h2>
          <div className="space-y-4">
            {LOSS_TYPES.map((loss) => (
              <label
                key={loss.name}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedLosses.includes(loss.name)}
                  onChange={() => handleLossChange(loss.name)}
                  className="w-4 h-4"
                />
                <span>
                  {loss.name} ({loss.amount} $million)
                </span>
              </label>
            ))}
            <p className="text-green-500 font-bold mt-4">
              Total SLM Amount: {totalSLM.toFixed(2)} ($million)
            </p>
          </div>
        </Card>

        {/* Total Risk Calculation */}
        <Card className="p-6 mb-8 bg-white">
          <h2 className="text-xl font-semibold mb-4">Total Risk ($million)</h2>
          <div className="space-y-2">
            <p>
              <strong>Total LEF:</strong>{" "}
              <input
                type="number"
                step="0.1"
                value={totalLEF}
                onChange={(e) => setTotalLEF(parseFloat(e.target.value))}
                className="p-2 bg-gray-700 rounded-md text-white w-24"
              />
            </p>
            <p>
              <strong>Total PLM:</strong> {totalPLM.toFixed(2)} ($million)
            </p>
            <p>
              <strong>Total SLM:</strong> {totalSLM.toFixed(2)} ($million)
            </p>
            <p className="text-red-500 font-bold text-2xl mt-4">
              Total Risk = Total LEF × Total PLM + Total SLM ={" "}
              {totalRisk.toFixed(2)} ($million)
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

