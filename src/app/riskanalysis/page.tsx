"use client";

import React, { useState,useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useAppContext } from "@/context/appcontext";

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
  { label: "Reputation Loss", value: 280 },
  { label: "Regulatory Penalties", value: 7.5 },
  { label: "Business Disruption", value: 12.5 },
  { label: "Customer Loss", value: 400 },
];

export default function RiskAnalysis() {
  const [selectedLosses, setSelectedLosses] = useState<string[]>([]);

  const { totalLef } = useAppContext();

const [selections, setSelections] = useState(["", "", "", ""]);
const handleSelect = (index: number, value: string) => {
    const newSelections = [...selections];
    newSelections[index] = value;
    setSelections(newSelections);
  };

  const getValue = (label: string) => {
    const item = LOSS_TYPES.find((t) => t.label === label);
    return item ? item.value : 0;
  };
  const totalAmount = selections.reduce((sum, sel) => sum + getValue(sel), 0);
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



  // Calculate Total Risk
  const totalRisk = totalLef * totalPLM + totalAmount;

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar Navigation */}
      <div className="w-1/4 bg-gray-800 p-6">
        <h2 className="text-2xl font-bold mb-4">Navigation</h2>
        <nav className="flex flex-col space-y-4">
          <Link
            href="/"
            className="p-3 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">
            Threat Actor Analysis
          </Link>
          <Link
            href="/vulnerabilityanalysis"
            className="p-3 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">
            Vulnerability Analysis
          </Link>
          <Link
            href="/riskanalysis"
            className="p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Risk Analysis
          </Link>
           <Link
          href="/securitycontrolsanalysis"
          className="p-3 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">
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
          <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Loss Type</th>
            <th className="text-left py-2">Amount ($million)</th>
          </tr>
        </thead>
        <tbody>
          {[0, 1, 2, 3].map((i) => (
            <tr key={i} className="border-t">
              <td className="py-2">
                <Select onValueChange={(val) => handleSelect(i, val)} defaultValue="">
                  <SelectTrigger className="w-60 bg-white">
                    <SelectValue placeholder="Select loss type" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOSS_TYPES.map((type) => (
                      <SelectItem key={type.label} value={type.label}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <td className="py-2 pl-4">
                ${getValue(selections[i]).toFixed(2)}
              </td>
            </tr>
          ))}
        {/* Total SLM row */}
  <tr className="border-t font-semibold">
    <td className="py-2 text-right pr-2">Total SLM ($million):</td>
    <td className="py-2 text-blue-700 pl-4">${totalAmount.toFixed(2)}</td>
  </tr>
        </tbody>
      </table>
        </Card>

        {/* Total Risk Calculation */}
        <Card className="p-6 mb-8 bg-white">
          <h2 className="text-xl font-semibold mb-4">Total Risk ($million)</h2>
          <div className="space-y-2">
            <p>
              <strong>Total LEF:</strong>{totalLef.toFixed((4))}
            </p>
            <p>
              <strong>Total PLM:</strong> {totalPLM.toFixed(2)}
            </p>
            <p>
              <strong>Total SLM:</strong> {totalAmount.toFixed(2)}
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

