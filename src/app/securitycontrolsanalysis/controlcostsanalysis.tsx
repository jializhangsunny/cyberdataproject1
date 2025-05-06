// @ts-ignore

"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";



export type CostKey = "purchase" | "operational" | "training" | "manpower";

export interface CostItem {
  control: string;
  purchase: number;
  operational: number;
  training: number;
  manpower: number;
}

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
      {/* 你的成本表格 code 保留这里 */}
    </Card>
  );
};

export default ControlCostsAnalysis;