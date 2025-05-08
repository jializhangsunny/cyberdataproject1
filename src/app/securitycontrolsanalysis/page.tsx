"use client";

import React, { Suspense, useState } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import type { CostItem } from "./controlcostsanalysis";
import EvaluationSuggestion from "@/components/evaluationsuggestion";
import ControlCostsAnalysis from "./controlcostsanalysis";
import ControlSelectionMatrix from "./controlselectionmatrix";
import { useAppContext } from "@/context/appcontext";

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

const SecurityControlsAnalysis = ({ setShowModal }: { setShowModal: (val: boolean) => void }) => {
  const { totalRisk } = useAppContext();

  const initialCosts: CostItem[] = [
    { control: "Network Segmentation", purchase: 5, operational: 5, training: 3, manpower: 2 },
    { control: "MS17-010 Patch", purchase: 12, operational: 4, training: 4, manpower: 7 },
    { control: "Patch Apache Struts", purchase: 30, operational: 20, training: 10, manpower: 22.8 },
  ];
  const [costs, setCosts] = useState<CostItem[]>(initialCosts);

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar Navigation */}
      <div className="w-1/4 bg-gray-800 p-6">
        <h2 className="text-2xl font-bold mb-4">Navigation</h2>
        <nav className="flex flex-col space-y-4">
          <Link href="/" className="p-3 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">Threat Actor Analysis</Link>
          <Link href="/vulnerabilityanalysis" className="p-3 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">Vulnerability Analysis</Link>
          <Link href="/riskanalysis" className="p-3 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">Risk Analysis</Link>
          <Link href="/securitycontrolsanalysis" className="p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600">Security Controls Analysis and ROSI Calculation</Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6 overflow-y-auto space-y-8">
        <h1 className="text-3xl font-bold mb-6">Security Controls Analysis & ROSI Calculation</h1>

        {/* Vulnerability-Control Mapping */}
        <Card className="bg-gray-300 text-black p-6">
          <h2 className="text-xl font-semibold mb-4">Vulnerability-Control Mapping</h2>
          <p><strong>Controls in Org:</strong> System Updated, Web Application Firewall</p>
          <p><strong>Recommended Controls from CTI:</strong> {recommendedControls.join(", ")}</p>
          <table className="mt-4 w-full text-sm border border-gray-400">
            <thead className="bg-gray-200 text-black">
              <tr>
                <th className="p-2 border">Vulnerability ID</th>
                <th className="p-2 border">Control 1 Name</th>
                <th className="p-2 border">Initial Risk ($M)</th>
                <th className="p-2 border">Risk Reduction Degree (Rd)</th>
                <th className="p-2 border">New Vulnerability Possibility</th>
                <th className="p-2 border">Potential New Risk</th>
                <th className="p-2 border">Net Risk Reduction (NRR)</th>
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
                    <td className="p-2 border">{vul.id}</td>
                    <td className="p-2 border">{control}</td>
                    <td className="p-2 border">{totalRisk.toFixed(2)}</td>
                    <td className="p-2 border">{rd}</td>
                    <td className="p-2 border">{newProb}</td>
                    <td className="p-2 border">{newRisk}</td>
                    <td className="p-2 border">{nrr.toFixed(2)}</td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan={7} className="p-2 font-semibold text-left bg-gray-100 border-t">Additional Controls</td>
              </tr>
              <tr>
                <td className="p-2 border" colSpan={2}>MS17-010 Patch</td>
                <td className="p-2 border">{totalRisk.toFixed(2)}</td>
                <td className="p-2 border">0.95</td>
                <td className="p-2 border">0.4</td>
                <td className="p-2 border">60</td>
                <td className="p-2 border">{(totalRisk * 0.95 - 0.4 * 60).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </Card>

        {/* Interaction Effect Analysis */}
        <Card className="bg-gray-300 text-black p-6">
          <h2 className="text-xl font-semibold mb-4">Interaction Effect Analysis of Controls</h2>
          <p className="mb-4"><strong>Note:</strong> Controls may overlap, produce synergies, or conflict with each other.</p>
          <table className="w-full text-sm border border-gray-400">
            <thead>
              <tr>
                <th className="p-2 border">Interaction Effect</th>
                <th className="p-2 border">Network Segmentation</th>
                <th className="p-2 border">Patch Apache Struts</th>
                <th className="p-2 border">MS17-010 Patch</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-2 border">Network Segmentation</td><td className="p-2 border text-center">-</td><td className="p-2 border text-center">-</td><td className="p-2 border text-center">-</td></tr>
              <tr><td className="p-2 border">Patch Apache Struts</td><td className="p-2 border text-center">0.8</td><td className="p-2 border text-center">-</td><td className="p-2 border text-center">-</td></tr>
              <tr><td className="p-2 border">MS17-010 Patch</td><td className="p-2 border text-center">0.5</td><td className="p-2 border text-center">0.8</td><td className="p-2 border text-center">-</td></tr>
            </tbody>
          </table>
        </Card>

        {/* Control Costs Analysis */}
        <ControlCostsAnalysis costs={costs} setCosts={setCosts} />

        {/* Control Selection Matrix */}
        <ControlSelectionMatrix costs={costs} />

        {/* Budget Info */}
        <Card className="bg-gray-300 text-black p-6">
          <h2 className="text-xl font-semibold mb-4">Budget Information</h2>
          {(() => {
            const totalBudget = 200;
            const totalCost = costs.reduce((sum, item) =>
              sum + item.purchase + item.operational + item.training + item.manpower, 0);
            const budgetStatus = totalCost <= totalBudget ? "Within Budget" : "Exceeds Budget";

            return (
              <div className="space-y-2 text-sm">
                <p><strong>Total Budget:</strong> ${totalBudget}</p>
                <p><strong>Total Cost:</strong> ${totalCost}</p>
                <p><strong>Budget Status:</strong> <span className={budgetStatus === "Within Budget" ? "text-green-600" : "text-red-600"}>{budgetStatus}</span></p>
              </div>
            );
          })()}
        </Card>

        {/* ROSI */}
        <Card className="bg-gray-300 text-black p-6">
          <h2 className="text-xl font-semibold mb-4">ROCSI Analysis</h2>
          <p>Return on Control Security Investment (ROCSI) based on selected controls.</p>
          <table className="w-full text-sm border border-gray-400 mt-4">
            <thead className="bg-gray-200 text-black">
              <tr>
                <th className="p-2 border">Control Set</th>
                <th className="p-2 border">Total NRR</th>
                <th className="p-2 border">Total Interaction Effect</th>
                <th className="p-2 border">Total Cost</th>
                <th className="p-2 border">ROCSI</th>
              </tr>
            </thead>
            <tbody>
  {(() => {
    const patchApacheNRR = totalRisk * 0.9 - 0.2 * 100;
    const ms17NRR = totalRisk * 0.95 - 0.4 * 60;
    const totalNRR = patchApacheNRR + ms17NRR;
    const ms17Cost = 27;
    const patchApacheCost = 82.8 ;
    const totalCost = ms17Cost + patchApacheCost;
   const totalRosci = ((totalNRR * 1.8) - totalCost) / totalCost;



    return (
      <tr>
        <td className="p-2 border">1) Patch Apache Struts<br />2) MS17-010 Patch</td>
        <td className="p-2 border">{totalNRR.toFixed(2)}</td>
        <td className="p-2 border">0.8</td>
        <td className="p-2 border">{totalCost.toFixed(2)}</td>
        <td className="p-2 border">{totalRosci.toFixed(2)}</td>
      </tr>
    );
  })()}
</tbody>
          </table>
        </Card>

        <button onClick={() => setShowModal(true)} className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
          Show Evaluation Suggestion
        </button>
      </div>
    </div>
  );
};

export default function WrappedPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        <SecurityControlsAnalysis setShowModal={setShowModal} />
        {showModal && <EvaluationSuggestion setShowModal={setShowModal} />}
      </div>
    </Suspense>
  );
}
