"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Slider } from "@mui/material";
//import { Tab } from "@headlessui/react";
import Link from "next/link";
import { useAppContext } from "@/context/appcontext";
import WeightInput from '@/components/weightinput';



// data
const SOPHISTICATION_LEVELS: Record<string, number> = {
  None: 1 - 6 / 7,
  Minimal: 1 - 5 / 7,
  Intermediate: 1 - 4 / 7,
  Advanced: 1 - 3 / 7,
  Expert: 1 - 2 / 7,
  Innovator: 1 - 1 / 7,
  Strategic: 1,
};

const RESOURCE_LEVELS: Record<string, number> = {
  Government: 1,
  Organization: 1 - 1 / 6,
  Team: 1 - 2 / 6,
  Contest: 1 - 3 / 6,
  Club: 1 - 4 / 6,
  Individual: 1 - 5 / 6,
};

// Financial Gain and Notoriety levels
const FinantialRelevance_LEVELS: Record<string, number> = {
  "Very high": 1,
  High: 0.8,
  Moderate: 0.5,
  Low: 0.2,
  "Very low": 0,
};

const NotorietyRelevance_LEVELS: Record<string, number> = {
  "Very high": 1,
  High: 0.8,
  Moderate: 0.5,
  Low: 0.2,
  "Very low": 0,
};

const DataTheft_LEVELS: Record<string, number> = {
  "Very high": 1,
  High: 0.8,
  Moderate: 0.5,
  Low: 0.2,
  "Very low": 0,
};



// Location and Sector Options
const LOCATIONS = ["U.S", "Europe", "Asia", "Africa", "South America", "North America"];
const SECTORS = ["Energy", "Materials", "Industrials", "Consumer Discretionary", "Consumer Staples", "Health Care", "Financials", "Information Technology", "Communication Services", "Utilities", "Real Estate",
];

const LEVELS = ["Very high", "High", "Moderate", "Low", "Very low"];
const COLORS = ["#8884d8", "#82ca9d"];

export default function Home() {

  const [sophistication, setSophistication] = useState("Advanced");
  const [resource, setResource] = useState("Organization");
  const [motivation1, setMotivation1] = useState("Low"); // Set initial level
  const [motivation2, setMotivation2] = useState("Moderate"); // Set initial level
  const [dataTheft, setDataTheft] = useState("Moderate"); // Set initial level for data theft
//Weights
const [financialGainWeight, setFinancialGainWeight] = useState(0.8);
const [notorietyWeight, setNotorietyWeight] = useState(0.2);
  // calculation values
  const sophisticationValue = SOPHISTICATION_LEVELS[sophistication] || 0;
  const resourceValue = RESOURCE_LEVELS[resource] || 0;
  const motivationScore1 = FinantialRelevance_LEVELS[motivation1] || 0;
  const motivationScore2 = NotorietyRelevance_LEVELS[motivation2] || 0;
  const dataTheftScore = DataTheft_LEVELS[dataTheft] || 0;
// State for Locations
const [orgLocation, setOrgLocation] = useState("U.S");
const [threatLocation, setThreatLocation] = useState("U.S");

// State for Sectors
const [orgSector, setOrgSector] = useState("Energy");
const [threatSector, setThreatSector] = useState("Energy");

// Calculate Match Scores
const locationMatchScore = orgLocation === threatLocation ? 1 : 0;
const sectorMatchScore = orgSector === threatSector ? 1 : 0;

  // weights
const [w1, setW1] = useState(0.6);
const [w2, setW2] = useState(0.4);

  // Threat Ability calculation
  const threatAbility = sophisticationValue * w1 + resourceValue * w2;
  const AverageMotivationscore = (FinantialRelevance_LEVELS[motivation1] * financialGainWeight) + (NotorietyRelevance_LEVELS[motivation2] * notorietyWeight);
    // Average Goal Score (same as data theft for now)
  const AverageGoalScore = dataTheftScore;

//component tefvalue

  const { setTefValue } = useAppContext();


 // TEF Calculation
 const tefValue =
 threatAbility *  AverageMotivationscore * AverageGoalScore * locationMatchScore * sectorMatchScore;

  useEffect(() => {
  setTefValue(tefValue);
}, [tefValue]);


 // Tab States
 //const [selectedTab, setSelectedTab] = useState(0);


  return (
    <div className="flex h-screen bg-gray-900 text-white">
    {/* Sidebar Navigation */}
    <div className="w-1/4 bg-gray-800 p-6">
      <h2 className="text-2xl font-bold mb-4">Navigation</h2>
      <nav className="flex flex-col space-y-4">
        <Link
          href="/"
          className="p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Threat Actor Analysis
        </Link>
        <Link
          href="/vulnerabilityanalysis"
          className="p-3 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">
          Vulnerability Analysis
        </Link>
        <Link
          href="/riskanalysis"
          className="p-3 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">
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
    <div className="w-3/4 p-6 space-y-8 overflow-y-auto">
      {/* Threat Actor Name */}
      <Card className="p-4 text-center bg-gray-800">
        <h1 className="text-3xl text-white font-bold">Threat Actor Name: Fin7</h1>
      </Card>

       {/* Sophistication and Resource Level */}
<div className="flex justify-between space-x-6">
  {/* Sophistication Level */}
  <Card className="p-4 w-1/2">
    <h2 className="text-xl font-semibold mb-2">Sophistication Level</h2>
    <Select onValueChange={setSophistication} defaultValue={sophistication}>
      <SelectTrigger className="w-full p-2 border rounded-md bg-white text-black">
        <SelectValue placeholder="Select Level" />
      </SelectTrigger>
      <SelectContent>
        {Object.keys(SOPHISTICATION_LEVELS).map((level) => (
          <SelectItem key={level} value={level}>
            {level}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    <div className="flex justify-center mt-4">
      <PieChart width={250} height={250}>
        <Pie
          data={[
            { name: "Selected", value: sophisticationValue },
            { name: "Remaining", value: 1 - sophisticationValue},
          ]}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {COLORS.map((color, index) => (
            <Cell key={index} fill={color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  </Card>

  {/* Resource Level */}
  <Card className="p-4 w-1/2">
    <h2 className="text-xl font-semibold mb-2">Resource Level</h2>
    <Select onValueChange={setResource} defaultValue={resource}>
      <SelectTrigger className="w-full p-2 border rounded-md bg-white text-black">
        <SelectValue placeholder="Select Level" />
      </SelectTrigger>
      <SelectContent>
        {Object.keys(RESOURCE_LEVELS).map((level) => (
          <SelectItem key={level} value={level}>
            {level}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    <div className="flex justify-center mt-4">
      <PieChart width={250} height={250}>
        <Pie
          data={[
            { name: "Selected", value: resourceValue },
            { name: "Remaining", value: 1 - resourceValue },
          ]}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          fill="#82ca9d"
          dataKey="value"
        >
          {COLORS.map((color, index) => (
            <Cell key={index} fill={color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  </Card>
</div>

{/* Weights Section */}
      <div className="flex justify-center">
     <WeightInput w1={w1} w2={w2} setW1={setW1} setW2={setW2} />
</div>

      {/* Threat Ability Calculation */}
      <Card className="p-4 mb-8 text-center bg-red-700">
        <h2 className="text-xl font-semibold">Threat Ability (TA)</h2>
        <p className="text-white text-2xl font-bold mt-2">{threatAbility.toFixed(4)}</p>
      </Card>

      {/* Motivation Analysis and Goals Analysis */}
      <div className="flex justify-between space-x-8 mb-8">
        {/* Motivation Analysis */}
        <Card className="p-4 flex-1">
          <h2 className="text-xl font-semibold">Motivation Analysis</h2>

{/* Weight Inputs */}
<div className="flex items-center space-x-4 mb-4">
  {/* Financial Gain Weight Input */}
  <div>
    <label className="block text-sm font-medium">Financial Gain Weight</label>
    <input
      type="number"
      step="0.1"
      min="0"
      max="1"
      value={financialGainWeight.toFixed(1)}
      onChange={(e) => {
        const input = parseFloat(e.target.value);
        if (!isNaN(input) && input >= 0 && input <= 1) {
          const clamped = Math.min(1, Math.max(0, input));
          setFinancialGainWeight(parseFloat(clamped.toFixed(1)));
          setNotorietyWeight(parseFloat((1 - clamped).toFixed(1)));
        }
      }}
      className="border p-1 rounded w-24"
    />
  </div>

  {/* Notoriety Weight Input */}
  <div>
    <label className="block text-sm font-medium">Notoriety Weight</label>
    <input
      type="number"
      step="0.1"
      min="0"
      max="1"
      value={notorietyWeight.toFixed(1)}
      onChange={(e) => {
        const input = parseFloat(e.target.value);
        if (!isNaN(input) && input >= 0 && input <= 1) {
          const clamped = Math.min(1, Math.max(0, input));
          setNotorietyWeight(parseFloat(clamped.toFixed(1)));
          setFinancialGainWeight(parseFloat((1 - clamped).toFixed(1)));
        }
      }}
      className="border p-1 rounded w-24"
    />
  </div>
</div>

          {/* Financial Gain Slider */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold">Financial Gain</h3>
            <div className="flex items-center space-x-4">
            <Slider
              value={LEVELS.indexOf(motivation1)} // slider value corresponds to index of levels
              onChange={(e, newValue) => setMotivation1(LEVELS[newValue as number])}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => LEVELS[value]}
              min={0}
              max={4}
              step={1}
              sx={{ width: 300 }}
            />
                <span className="text-md font-medium text-gray-700">
      {(FinantialRelevance_LEVELS[motivation1] * financialGainWeight).toFixed(2)}
    </span>
          </div>
          </div>
          {/* Notoriety Slider */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold">Notoriety</h3>
                <div className="flex items-center space-x-4">
            <Slider
              value={LEVELS.indexOf(motivation2)} // slider value corresponds to index of levels
              onChange={(e, newValue) => setMotivation2(LEVELS[newValue as number])}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => LEVELS[value]}
              min={0}
              max={4}
              step={1}
              sx={{ width: 300 }}
            />
              <span className="text-md font-medium text-gray-700">
      {(NotorietyRelevance_LEVELS[motivation2] * notorietyWeight).toFixed(2)}
              </span>
               </div>
          </div>

          {/* Average Motivation Score */}
          <Card className="p-4 text-center bg-gray-800">
            <h3 className="text-lg text-white font-semibold">Average Motivation Score</h3>
            <p className="text-white text-2xl font-bold mt-2">{AverageMotivationscore.toFixed(2)}</p>
          </Card>
        </Card>

        {/* Goals Analysis (Data Theft) */}
        <Card className="p-4 flex-1">
          <h2 className="text-xl font-semibold">Goals Analysis</h2>

{/* Data Theft Weight Display */}
    <div className="mb-4">
      <label className="block text-sm font-medium">Data Theft Weight</label>
      <input
        type="number"
        value={1}
        disabled
        className="border p-1 rounded w-24 bg-gray-100 text-gray-600"
      />
    </div>

          {/* Data Theft Slider */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold">Data Theft</h3>
            <Slider
              value={LEVELS.indexOf(dataTheft)} // slider value corresponds to index of levels
              onChange={(e, newValue) => setDataTheft(LEVELS[newValue as number])}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => LEVELS[value]}
              min={0}
              max={4}
              step={1}
              sx={{ width: 300 }}
            />
          </div>

          {/* Average Goal Score */}
          <Card className="p-4 text-center bg-gray-800">
            <h3 className="text-lg text-white font-semibold">Average Goal Score</h3>
            <p className="text-white text-2xl font-bold mt-2">{dataTheftScore.toFixed(2)}</p>
          </Card>
        </Card>
      </div>



     {/* Location and Sector Match Row */}
     <div className="flex justify-between space-x-8 mb-8">
     {/* Location Match */}
     <Card className="p-4 flex-1">
       <h2 className="text-xl font-semibold mb-2">Location Match</h2>

      {/* Organization Location */}
      <div className="mb-4">
            <h3 className="text-lg">Organization Location</h3>
            <Select onValueChange={setOrgLocation} defaultValue={orgLocation}>
              <SelectTrigger className="w-full p-2 border rounded-md bg-white text-black">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Threat Actor Location */}
          <div className="mb-4">
            <h3 className="text-lg">Threat Actor Location</h3>
            <Select onValueChange={setThreatLocation} defaultValue={threatLocation}>
              <SelectTrigger className="w-full p-2 border rounded-md bg-white text-black">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bar Chart for Location Match */}
          <BarChart width={250} height={200} data={[{ name: "Location Match", score: locationMatchScore }]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 1]} />
            <Bar dataKey="score" fill="#8884d8" />
          </BarChart>
        </Card>
        {/* Sector Match */}
        <Card className="p-4 flex-1">
          <h2 className="text-xl font-semibold mb-2">Sector Match</h2>

          {/* Organization Sector */}
          <div className="mb-4">
            <h3 className="text-lg">Organization Sector</h3>
            <Select onValueChange={setOrgSector} defaultValue={orgSector}>
              <SelectTrigger className="w-full p-2 border rounded-md bg-white text-black">
                <SelectValue placeholder="Select Sector" />
              </SelectTrigger>
              <SelectContent>
                {SECTORS.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Threat Actor Sector */}
          <div className="mb-4">
            <h3 className="text-lg">Threat Actor Sector</h3>
            <Select onValueChange={setThreatSector} defaultValue={threatSector}>
              <SelectTrigger className="w-full p-2 border rounded-md bg-white text-black">
                <SelectValue placeholder="Select Sector" />
              </SelectTrigger>
              <SelectContent>
                {SECTORS.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bar Chart for Sector Match */}
          <BarChart width={250} height={200} data={[{ name: "Sector Match", score: sectorMatchScore }]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 1]} />
            <Bar dataKey="score" fill="#82ca9d" />
          </BarChart>
        </Card>

              {/* TEF Calculation Card */}
      <Card className="p-4 mb-8 text-center bg-red-700">
        <h2 className="text-xl font-semibold">Final TEF Calculation</h2>
        <p className="text-white text-2xl font-bold mt-2">{tefValue.toFixed(4)}</p>
      </Card>

        </div>
    </div>
   </div>
  );
}
