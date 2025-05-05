// @ts-ignore

"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";


const commonVulnerabilities = [
  { id: "CVE-2017-0144", control: "Network Segmentation" },
  { id: "CVE-2017-5638", control: "Patch Apache Struts" },
];

const recommendedControls = [
  "Patch Apache Struts",
  "Network Segmentation",
  "MS17-010 Patch",
  "Web Application Firewall",
];

const SecurityControlsAnalysis = () => {
 const searchParams = useSearchParams();
  const totalRisk = Number(searchParams.get("totalRisk")) || 500;
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
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
          href="/securitycontrolsanalysis"
          className="p-3 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
        >
          Security Controls Analysis and ROSI Calculation
        </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6 overflow-y-auto space-y-8">
        <h1 className="text-3xl font-bold mb-6">Security Controls Analysis & ROSI Calculation</h1>

        {/* 1. Vulnerability-Control Mapping */}
        <Card className="bg-gray-300 text-black p-6">
          <h2 className="text-xl font-semibold mb-4">Vulnerability-Control Mapping</h2>
          <p><strong>Controls in Org:</strong> System Updated, Web Application Firewall</p>
          <p><strong>Recommended Controls from CTI:</strong> {recommendedControls.join(", ")}</p>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr>
                <th>Vulnerability ID</th>
                <th>Control 1 Name</th>
                <th>Initial Risk ($M)</th>
                <th>Rd</th>
                <th>New Possibility</th>
                <th>New Risk</th>
                <th>NRR</th>
              </tr>
            </thead>
            <tbody>
              {commonVulnerabilities.map((vul, i) => {
                const control = vul.control;
                const rd = i === 0 ? 0.8 : 0.9;
                const newProb = i === 0 ? 0.3 : 0.2;
                const newRisk = i === 0 ? 10 : 100;
                const nrr = totalRisk * rd - newProb * newRisk;
                return (
                  <tr key={vul.id}>
                    <td>{vul.id}</td>
                    <td>{control}</td>
                    <td>{totalRisk}</td>
                    <td>{rd}</td>
                    <td>{newProb}</td>
                    <td>{newRisk}</td>
                    <td>{nrr.toFixed(2)}</td>
                  </tr>
                );
              })}
              {/* Control 2 Row */}
              <tr>
                <td colSpan={2}>MS17-010 Patch</td>
                <td>{totalRisk}</td>
                <td>0.95</td>
                <td>0.4</td>
                <td>60</td>
                <td>{(totalRisk * 0.95 - 0.4 * 60).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </Card>

        {/* 2. Interaction Effect Analysis of Controls */}
        <Card className="bg-gray-300 text-black p-6">
          <h2 className="text-xl font-semibold mb-4">Interaction Effect Analysis of Controls</h2>
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white p-2 rounded-md">Show Evaluation Suggestion</button>
        </Card>

        {/* 3. Control Costs Analysis */}
        <Card className="bg-gray-300 text-black p-6">
          <h2 className="text-xl font-semibold mb-4">Control Costs Analysis</h2>
          <p>Estimate and compare implementation and maintenance costs of selected controls.</p>
        </Card>

        {/* 4. Control Selection Matrix 1 */}
        <Card className="bg-gray-300 text-black p-6">
          <h2 className="text-xl font-semibold mb-4">Control Selection Matrix #1</h2>
          <p>Example matrix with efficiency vs cost for recommended controls.</p>
        </Card>

        {/* 5. Control Selection Matrix 2 */}
        <Card className="bg-gray-300 text-black p-6">
          <h2 className="text-xl font-semibold mb-4">Control Selection Matrix #2</h2>
          <p>Control impact vs vulnerability criticality mapping.</p>
        </Card>

        {/* 6. Control Selection Matrix 3 */}
        <Card className="bg-gray-300 text-black p-6">
          <h2 className="text-xl font-semibold mb-4">Control Selection Matrix #3</h2>
          <p>Control compatibility and operational risk chart.</p>
        </Card>

        {/* Modal for Evaluation Suggestion */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-100 text-black p-6 rounded-lg max-w-2xl w-full">
              <h2 className="text-xl font-bold mb-4">Evaluation Suggestion</h2>
              <table className="w-full mb-4 text-sm">
                <thead>
                  <tr>
                    <th>Effect</th>
                    <th>Extent</th>
                    <th>Weight</th>
                    <th>Overlap</th>
                    <th>Synergistic</th>
                    <th>Conflict</th>
                    <th>Interaction Effect</th>
                  </tr>
                </thead>
                <tbody>
                  {[0.6, 0.8, 0.3].map((weight, i) => {
                    const overlap = 0.5 + i * 0.1;
                    const synergy = 0.4 + i * 0.1;
                    const conflict = 0.1 * i;
                    const ie = weight * (overlap + synergy + conflict);
                    return (
                      <tr key={i}>
                        <td>Effect {i + 1}</td>
                        <td>{(weight * 100).toFixed(0)}%</td>
                        <td>{weight}</td>
                        <td>{overlap}</td>
                        <td>{synergy}</td>
                        <td>{conflict}</td>
                        <td>{ie.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="text-xl font-bold">
                Total Interaction Effect:{" "}
                {([0.6, 0.8, 0.3].reduce((sum, weight, i) => {
                  const overlap = 0.5 + i * 0.1;
                  const synergy = 0.4 + i * 0.1;
                  const conflict = 0.1 * i;
                  return sum + weight * (overlap + synergy + conflict);
                }, 0)).toFixed(2)}
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityControlsAnalysis;
