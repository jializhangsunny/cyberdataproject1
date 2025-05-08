// @ts-ignore
"use client";

import React from "react";
import { Card } from "@/components/ui/card";

export type CostKey = "purchase" | "operational" | "training" | "manpower";

export type CostItem = {
  control: string;
  purchase: number;
  operational: number;
  training: number;
  manpower: number;
};

interface Props {
  costs: CostItem[];
  setCosts: React.Dispatch<React.SetStateAction<CostItem[]>>;
}

const ControlCostsAnalysis: React.FC<Props> = ({ costs, setCosts }) => {
  const calculateTotal = (item: CostItem) =>
    item.purchase + item.operational + item.training + item.manpower;

  return (
    <Card className="bg-gray-300 text-black p-6">
      <h2 className="text-xl font-semibold mb-4">Control Costs Analysis</h2>
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b font-semibold">
            <th className="p-2">Control Name</th>
            <th className="p-2">Purchase Cost</th>
            <th className="p-2">Operational Cost</th>
            <th className="p-2">Training Cost</th>
            <th className="p-2">Manpower Cost</th>
            <th className="p-2">Total Cost</th>
          </tr>
        </thead>
        <tbody>
          {costs.map((item, index) => (
            <tr key={index} className="border-t">
              <td className="p-2">{item.control}</td>
              <td className="p-2">{item.purchase}</td>
              <td className="p-2">{item.operational}</td>
              <td className="p-2">{item.training}</td>
              <td className="p-2">{item.manpower}</td>
              <td className="p-2 font-semibold">{calculateTotal(item).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

export default ControlCostsAnalysis;
