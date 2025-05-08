"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Slider } from "@mui/material";
import Link from "next/link";

const SOPHISTICATION_LEVELS = {
  None: 1 - 6 / 7,
  Minimal: 1 - 5 / 7,
  Intermediate: 1 - 4 / 7,
  Advanced: 1 - 3 / 7,
  Expert: 1 - 2 / 7,
  Innovator: 1 - 1 / 7,
  Strategic: 1,
};

const RESOURCE_LEVELS = {
  Government: 1,
  Organization: 1 - 1 / 6,
  Team: 1 - 2 / 6,
  Contest: 1 - 3 / 6,
  Club: 1 - 4 / 6,
  Individual: 1 - 5 / 6,
};

const FinantialRelevance_LEVELS = {
  "Very high": 0.8,
  High: 0.64,
  Moderate: 0.4,
  Low: 0.16,
  "Very low": 0,
};

const NotorietyRelevance_LEVELS = {
  "Very high": 0.2,
  High: 0.16,
  Moderate: 0.1,
  Low: 0.04,
  "Very low": 0,
};

const DataTheft_LEVELS = {
  "Very high": 1,
  High: 0.8,
  Moderate: 0.5,
  Low: 0.2,
  "Very low": 0,
};

const LOCATIONS = ["U.S", "Europe", "Asia", "Africa", "South America", "North America"];
const SECTORS = [
  "Energy",
  "Materials",
  "Industrials",
  "Consumer Discretionary",
  "Consumer Staples",
  "Health Care",
  "Financials",
  "Information Technology",
  "Communication Services",
  "Utilities",
  "Real Estate",
];

const LEVELS = ["Very high", "High", "Moderate", "Low", "Very low"];
const COLORS = ["#8884d8", "#82ca9d"];

export default function Home() {
  const [sophistication, setSophistication] = useState("None");
  const [resource, setResource] = useState("Government");
  const [motivation1, setMotivation1] = useState("Very high");
  const [motivation2, setMotivation2] = useState("Very high");
  const [dataTheft, setDataTheft] = useState("Very high");
  const [orgLocation, setOrgLocation] = useState("U.S");
  const [threatLocation, setThreatLocation] = useState("U.S");
  const [orgSector, setOrgSector] = useState("Energy");
  const [threatSector, setThreatSector] = useState("Energy");

  const sophisticationValue = SOPHISTICATION_LEVELS[sophistication] || 0;
  const resourceValue = RESOURCE_LEVELS[resource] || 0;
  const motivationScore1 = FinantialRelevance_LEVELS[motivation1] || 0;
  const motivationScore2 = NotorietyRelevance_LEVELS[motivation2] || 0;
  const dataTheftScore = DataTheft_LEVELS[dataTheft] || 0;

  const locationMatchScore = orgLocation === threatLocation ? 1 : 0;
  const sectorMatchScore = orgSector === threatSector ? 1 : 0;

  const w1 = 0.6;
  const w2 = 0.4;

  const threatAbility = sophisticationValue * w1 + resourceValue * w2;
  const AverageMotivationscore = motivationScore1 + motivationScore2;
  const AverageGoalScore = dataTheftScore;

  const tefValue =
    threatAbility * AverageMotivationscore * AverageGoalScore * locationMatchScore * sectorMatchScore;

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-800 p-6">
        <h2 className="text-2xl font-bold mb-4">Navigation</h2>
        <nav className="flex flex-col space-y-4">
          <Link href="/" className="p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Threat Actor Analysis
          </Link>
          <Link href="/riskanalysis" className="p-3 bg-gray-700 rounded-md hover:bg-gray-600">
            Risk Analysis
          </Link>
          <Link href="/vulnerabilityanalysis" className="p-3 bg-gray-700 rounded-md hover:bg-gray-600">
            Vulnerability Analysis
          </Link>
          <Link href="/securitycontrolsanalysis" className="p-3 bg-gray-700 rounded-md hover:bg-gray-600">
            Security Controls Analysis
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6 space-y-6 overflow-y-auto">
        {/* Threat Actor Name */}
        <Card className="p-4 text-center bg-gray-800">
          <h1 className="text-3xl text-white font-bold">Threat Actor Name: Fin7</h1>
        </Card>

        {/* Sophistication and Resource Level */}
        <div className="flex justify-between">
          {[["Sophistication Level", sophistication, setSophistication, sophisticationValue],
            ["Resource Level", resource, setResource, resourceValue]].map(
            ([title, state, setState, value], i) => (
              <Card key={i} className="p-4 flex-1 mx-2">
                <h2 className="text-xl font-semibold mb-2">{title}</h2>
                <Select onValueChange={setState} defaultValue={state}>
                  <SelectTrigger className="w-full p-2 bg-white text-black rounded-md">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(i === 0 ? SOPHISTICATION_LEVELS : RESOURCE_LEVELS).map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <PieChart width={300} height={300}>
                  <Pie
                    data={[
                      { name: "Selected", value },
                      { name: "Remaining", value: 1 - value },
                    ]}
                    cx={150}
                    cy={150}
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {COLORS.map((color, idx) => (
                      <Cell key={idx} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </Card>
            )
          )}
        </div>

        {/* Weights */}
        <Card className="p-4 text-center">
          <h2 className="text-xl font-semibold">Weights</h2>
          <p className="text-gray-400">Sophistication Weight (w1): {w1}</p>
          <p className="text-gray-400">Resource Weight (w2): {w2}</p>
          <p className="text-gray-400 font-bold mt-2">w1 + w2 = 1</p>
        </Card>

        {/* Threat Ability */}
        <Card className="p-4 text-center bg-red-700">
          <h2 className="text-xl font-semibold">Threat Ability (TA)</h2>
          <p className="text-white text-2xl font-bold mt-2">{threatAbility.toFixed(2)}</p>
        </Card>

        {/* Motivation & Goals */}
        <div className="flex space-x-6">
          {/* Motivation */}
          <Card className="p-4 flex-1">
            <h2 className="text-xl font-semibold">Motivation Analysis</h2>
            {["Financial Gain", "Notoriety"].map((label, idx) => (
              <div key={idx} className="mb-6">
                <h3 className="text-lg font-semibold">{label}</h3>
                <Slider
                  value={LEVELS.indexOf(idx === 0 ? motivation1 : motivation2)}
                  onChange={(e, v) =>
                    idx === 0 ? setMotivation1(LEVELS[v as number]) : setMotivation2(LEVELS[v as number])
                  }
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => LEVELS[v]}
                  min={0}
                  max={4}
                  step={1}
                />
              </div>
            ))}
            <Card className="p-4 text-center bg-gray-800">
              <h3 className="text-white font-semibold">Average Motivation Score</h3>
              <p className="text-2xl text-red-500 font-bold">{AverageMotivationscore.toFixed(2)}</p>
            </Card>
          </Card>

          {/* Goals */}
          <Card className="p-4 flex-1">
            <h2 className="text-xl font-semibold">Goals Analysis</h2>
            <div className="mb-6">
              <h3 className="text-lg font-semibold">Data Theft</h3>
              <Slider
                value={LEVELS.indexOf(dataTheft)}
                onChange={(e, v) => setDataTheft(LEVELS[v as number])}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => LEVELS[v]}
                min={0}
                max={4}
                step={1}
              />
            </div>
            <Card className="p-4 text-center bg-gray-800">
              <h3 className="text-white font-semibold">Average Goal Score</h3>
              <p className="text-2xl text-red-500 font-bold">{dataTheftScore.toFixed(2)}</p>
            </Card>
          </Card>
        </div>

        {/* Location and Sector Match */}
        <div className="flex space-x-6">
          {[["Location", LOCATIONS, orgLocation, setOrgLocation, threatLocation, setThreatLocation, locationMatchScore],
            ["Sector", SECTORS, orgSector, setOrgSector, threatSector, setThreatSector, sectorMatchScore]].map(
            ([label, options, oVal, setO, tVal, setT, score], i) => (
              <Card key={i} className="p-4 flex-1">
                <h2 className="text-xl font-semibold mb-2">{label} Match</h2>
                <div className="mb-4">
                  <h3 className="text-lg">{label} (Org)</h3>
                  <Select onValueChange={setO} defaultValue={oVal}>
                    <SelectTrigger className="w-full p-2 bg-white text-black rounded-md">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((val) => (
                        <SelectItem key={val} value={val}>
                          {val}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg">{label} (Threat)</h3>
                  <Select onValueChange={setT} defaultValue={tVal}>
                    <SelectTrigger className="w-full p-2 bg-white text-black rounded-md">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((val) => (
                        <SelectItem key={val} value={val}>
                          {val}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <BarChart width={250} height={200} data={[{ name: `${label} Match`, score }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 1]} />
                  <Bar dataKey="score" fill={i === 0 ? "#8884d8" : "#82ca9d"} />
                </BarChart>
              </Card>
            )
          )}
        </div>

        {/* TEF Calculation */}
        <Card className="p-4 text-center bg-red-700">
          <h2 className="text-xl font-semibold">Final TEF Calculation</h2>
          <p className="text-white text-2xl font-bold mt-2">{tefValue.toFixed(4)}</p>
        </Card>
      </div>
    </div>
  );
}
