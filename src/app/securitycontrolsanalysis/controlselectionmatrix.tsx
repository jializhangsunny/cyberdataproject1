// @ts-ignore

"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { CostItem } from "./controlcostsanalysis";
import { useAppContext } from "@/context/appcontext";

interface ControlSelectionMatrixProps {
  costs: CostItem[];
}

const ControlSelectionMatrix: React.FC<ControlSelectionMatrixProps> = ({ costs }) => {
  const [selections, setSelections] = useState<(string | "Yes" | "No")[]>(
    costs.map(() => "No")
  );
  const { totalRisk } = useAppContext();
  const safeTotalRisk = typeof totalRisk === "number" ? totalRisk : 0;
  const handleChange = (index: number, value: "Yes" | "No") => {
    const updated = [...selections];
    updated[index] = value;
    setSelections(updated);
  };


  const nrrValues = {
    "Network Segmentation": 1458.975886,
    "MS17-010 Patch": safeTotalRisk.toFixed(2),
    "Patch Apache Struts": safeTotalRisk.toFixed(2),
  };

  return (
    <Card className="bg-gray-300 text-black p-6">
      <h2 className="text-xl font-semibold mb-4">Control Selection Matrix</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-400 text-center">
          <thead>
            <tr>
              <th className="border border-gray-400 p-2">Control Name</th>
              {costs.map((control, i) => (
                <th key={i} className="border border-gray-400 p-2">
                  {control.control}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 p-2 font-medium">Include in Set</td>
              {selections.map((value, i) => (
                <td key={i} className="border border-gray-400 p-2">
                  <select
                    className="bg-white text-black px-2 py-1 rounded border"
                    value={value}
                    onChange={(e) =>
                      handleChange(i, e.target.value as "Yes" | "No")
                    }
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </td>
              ))}
            </tr>
       <tr>
  <td className="border border-gray-400 p-2 font-medium">Individual NRR</td>
  {costs.map((control, i) => {
   const nrr = nrrValues[control.control as keyof typeof nrrValues];
    return (
      <td key={i} className="border border-gray-400 p-2">
        {nrr ? nrr : "N/A"}
      </td>
    );
  })}
</tr>
            <tr>
              <td className="border border-gray-400 p-2 font-medium">Total Cost / Control</td>
              {costs.map((control, i) => {
                const cost =
                  control.purchase +
                  control.operational +
                  control.training +
                  control.manpower;
                return (
                  <td key={i} className="border border-gray-400 p-2">
                    {cost.toFixed(2)}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="border border-gray-400 p-2 font-medium">Individual ROSI</td>
              {costs.map((control, i) => {
                const totalCost =
                  control.purchase +
                  control.operational +
                  control.training +
                  control.manpower;
               const nrr = nrrValues[control.control as keyof typeof nrrValues];
const rosi =
  nrr && totalCost
    ? (Number(nrr) - totalCost) / totalCost
    : 0;
                return (
                  <td key={i} className="border border-gray-400 p-2 font-bold">
                    {rosi.toFixed(2)}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ControlSelectionMatrix;