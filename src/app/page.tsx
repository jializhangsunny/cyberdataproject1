"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useAppContext } from "@/context/appcontext";

// Import your API service
import threatActorService from '../services/threatActors'

// TypeScript interfaces for getAll response
interface ThreatActorSummary {
  id: string;
  name: string;
  sophisticationLevel: string;
  resourceLevel: string;
  location: string;
  sector: string;
  motivations: Array<{ name: string; id: string; }>;
  goals: Array<{ name: string; id: string; }>;
  exploits: Array<{ vulnerabilityId: string; id: string; }>;
  createdAt: string;
  updatedAt: string;
}

// TypeScript interfaces for getById response (detailed)
interface DetailedMotivation {
  name: string;
  relevanceLevel: string;
  weight: number;
  id: string;
}

interface DetailedGoal {
  name: string;
  relevanceLevel: string;
  weight: number;
  id: string;
}

interface DetailedExploit {
  vulnerabilityId: string;
  attackPattern: string;
  toolMalwareUsed: string;
  id: string;
}

interface DetailedThreatActor {
  id: string;
  name: string;
  sophisticationLevel: string;
  resourceLevel: string;
  location: string;
  sector: string;
  motivations: DetailedMotivation[];
  goals: DetailedGoal[];
  exploits: DetailedExploit[];
  createdAt: string;
  updatedAt: string;
}

const SOPHISTICATION_LEVELS: { [key: string]: number } = {
  "None": 1 - 6/7,
  "Minimal": 1 - 5/7,
  "Intermediate": 1 - 4/7,
  "Advanced": 1 - 3/7,
  "Expert": 1 - 2/7,
  "Innovator": 1 - 1/7,
  "Strategic": 1,
};

const RESOURCE_LEVELS: { [key: string]: number } = {
  "Government": 1,
  "Organization": 1 - 1/6,
  "Team": 1 - 2/6,
  "Contest": 1 - 3/6,
  "Club": 1 - 4/6,
  "Individual": 1 - 5/6,
};

const RELEVANCE_LEVELS: { [key: string]: number } = {
  "Very High": 1.0,
  "High": 0.8,
  "Moderate": 0.5,
  "Low": 0.2,
  "Very Low": 0.1,
};

const LOCATIONS = ["U.S.", "Europe", "Asia", "Africa", "South America", "North America"];
const SECTORS = [
  "Energy", "Materials", "Industrials", "Consumer Discretionary", 
  "Consumer Staples", "Health Care", "Financials", "Information Technology", 
  "Communication Services", "Utilities", "Real Estate"
];

const COLORS = ["#8884d8", "#82ca9d"];

export default function Home() {
  // Backend data state
  const [threatActors, setThreatActors] = useState<ThreatActorSummary[]>([]);
  const [selectedThreatActor, setSelectedThreatActor] = useState<DetailedThreatActor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [orgLocation, setOrgLocation] = useState<string>("U.S.");
  const [orgSector, setOrgSector] = useState<string>("Energy");

  const { setTefValue } = useAppContext();

  // Fetch all threat actors on component mount
  useEffect(() => {
    const fetchThreatActors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await threatActorService.getAll();
        setThreatActors(data);
        
        // Set first threat actor as default if available
        if (data.length > 0) {
          await loadThreatActorDetails(data[0].id);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch threat actors');
        console.error('Error fetching threat actors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchThreatActors();
  }, []);

  // Load detailed threat actor data
  const loadThreatActorDetails = useCallback(async (threatActorId: string) => {
    try {
      setLoading(true);
      const threatActor = await threatActorService.getById(threatActorId);
      setSelectedThreatActor(threatActor);
    } catch (err: any) {
      setError(err.message || 'Failed to load threat actor details');
      console.error('Error loading threat actor details:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle threat actor selection change
  const handleThreatActorChange = useCallback(async (threatActorId: string) => {
    await loadThreatActorDetails(threatActorId);
  }, [loadThreatActorDetails]);

  // Calculations
  const sophisticationValue = selectedThreatActor 
    ? (SOPHISTICATION_LEVELS[selectedThreatActor.sophisticationLevel] || 0)
    : 0;
  
  const resourceValue = selectedThreatActor 
    ? (RESOURCE_LEVELS[selectedThreatActor.resourceLevel] || 0)
    : 0;

  // Calculate motivation scores using backend data
  const motivationScore = selectedThreatActor 
    ? selectedThreatActor.motivations.reduce((total, motivation) => {
        const relevanceValue = RELEVANCE_LEVELS[motivation.relevanceLevel] || 0;
        return total + (relevanceValue * motivation.weight);
      }, 0)
    : 0;

  // Calculate goal scores using backend data
  const goalScore = selectedThreatActor 
    ? selectedThreatActor.goals.reduce((total, goal) => {
        const relevanceValue = RELEVANCE_LEVELS[goal.relevanceLevel] || 0;
        return total + (relevanceValue * goal.weight);
      }, 0)
    : 0;
  
  const locationMatchScore = selectedThreatActor && orgLocation === selectedThreatActor.location ? 1 : 0;
  const sectorMatchScore = selectedThreatActor && orgSector === selectedThreatActor.sector ? 1 : 0;

  const w1 = 0.6;
  const w2 = 0.4;

  const threatAbility = sophisticationValue * w1 + resourceValue * w2;

  const tefValue = threatAbility * motivationScore * goalScore * locationMatchScore * sectorMatchScore;

  useEffect(() => {
    setTefValue(tefValue);
  }, [tefValue, setTefValue]);

  // Loading state
  if (loading && threatActors.length === 0) {
    return (
      <div className="flex h-screen bg-gray-900 text-white items-center justify-center">
        <div className="text-2xl">Loading threat actors...</div>
      </div>
    );
  }

  // Error state
  if (error && threatActors.length === 0) {
    return (
      <div className="flex h-screen bg-gray-900 text-white items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-red-500 mb-4">Error: {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
        {/* Threat Actor Selection */}
        {threatActors.length > 0 && (
          <Card className="p-4 bg-gray-800">
            <h2 className="text-xl font-semibold mb-2 text-white">Select Threat Actor</h2>
            <Select onValueChange={handleThreatActorChange} value={selectedThreatActor?.id || ""}>
              <SelectTrigger className="w-full p-2 border rounded-md bg-white text-black">
                <SelectValue placeholder="Select Threat Actor" />
              </SelectTrigger>
              <SelectContent>
                {threatActors.map((actor) => (
                  <SelectItem key={actor.id} value={actor.id}>
                    {actor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <div className="text-sm text-red-400 mt-2">{error}</div>}
          </Card>
        )}

        {/* Threat Actor Name */}
        <Card className="p-4 text-center bg-gray-800">
          <h1 className="text-3xl text-white font-bold">
            Threat Actor Name: {selectedThreatActor?.name || "No Actor Selected"}
          </h1>
        </Card>

        {/* Sophistication and Resource Level */}
        <div className="flex justify-between space-x-6">
          {/* Sophistication Level */}
          <Card className="p-4 w-1/2">
            <h2 className="text-xl font-semibold mb-2">Sophistication Level</h2>
            <div className="w-full p-3 border rounded-md bg-gray-700 text-white">
              <span className="font-medium">{selectedThreatActor?.sophisticationLevel || "Not Available"}</span>
            </div>
            <div className="flex justify-center mt-4">
              <PieChart width={250} height={250}>
                <Pie
                  data={[
                    { name: "Selected", value: sophisticationValue },
                    { name: "Remaining", value: 1 - sophisticationValue },
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
            <div className="w-full p-3 border rounded-md bg-gray-700 text-white">
              <span className="font-medium">{selectedThreatActor?.resourceLevel || "Not Available"}</span>
            </div>

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
        <Card className="p-4 mb-4 text-center">
          <h2 className="text-xl font-semibold">Weights</h2>
          <p className="text-gray-400">
            Sophistication Weight (w1): <span className="text-red">{w1}</span>
          </p>
          <p className="text-gray-400">
            Resource Weight (w2): <span className="text-red">{w2}</span>
          </p>
          <p className="text-gray-400 font-bold mt-2">w1 + w2 = 1</p>
        </Card>

        {/* Threat Ability Calculation */}
        <Card className="p-4 mb-8 text-center bg-red-700">
          <h2 className="text-xl font-semibold">Threat Ability (TA)</h2>
          <p className="text-white text-2xl font-bold mt-2">{threatAbility.toFixed(2)}</p>
        </Card>

        {/* Motivation Analysis and Goals Analysis */}
        <div className="flex justify-between space-x-8 mb-8">
          {/* Motivation Analysis */}
          <Card className="p-4 flex-1">
            <h2 className="text-xl font-semibold mb-4">Motivation Analysis</h2>
            
            {selectedThreatActor?.motivations && selectedThreatActor.motivations.length > 0 ? (
              <div className="space-y-4">
                {selectedThreatActor.motivations.map((motivation, index) => (
                  <div key={motivation.id} className="p-3 bg-gray-700 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{motivation.name}</span>
                      <span className="text-sm text-gray-300">{motivation.relevanceLevel}</span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Weight: {motivation.weight} | Score: {((RELEVANCE_LEVELS[motivation.relevanceLevel] || 0) * motivation.weight).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400">No motivations available</div>
            )}

            {/* Total Motivation Score */}
            <Card className="p-4 text-center bg-gray-800 mt-4">
              <h3 className="text-lg text-white font-semibold">Total Motivation Score</h3>
              <p className="text-white text-2xl font-bold mt-2">{motivationScore.toFixed(2)}</p>
            </Card>
          </Card>

          {/* Goals Analysis */}
          <Card className="p-4 flex-1">
            <h2 className="text-xl font-semibold mb-4">Goals Analysis</h2>

            {selectedThreatActor?.goals && selectedThreatActor.goals.length > 0 ? (
              <div className="space-y-4">
                {selectedThreatActor.goals.map((goal, index) => (
                  <div key={goal.id} className="p-3 bg-gray-700 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{goal.name}</span>
                      <span className="text-sm text-gray-300">{goal.relevanceLevel}</span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Weight: {goal.weight} | Score: {((RELEVANCE_LEVELS[goal.relevanceLevel] || 0) * goal.weight).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400">No goals available</div>
            )}

            {/* Total Goal Score */}
            <Card className="p-4 text-center bg-gray-800 mt-4">
              <h3 className="text-lg text-white font-semibold">Total Goal Score</h3>
              <p className="text-white text-2xl font-bold mt-2">{goalScore.toFixed(2)}</p>
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
              <Select onValueChange={setOrgLocation} value={orgLocation}>
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
              <div className="w-full p-3 border rounded-md bg-gray-700 text-white">
                <span className="font-medium">{selectedThreatActor?.location || "Not Available"}</span>
              </div>
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
              <Select onValueChange={setOrgSector} value={orgSector}>
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
              <div className="w-full p-3 border rounded-md bg-gray-700 text-white">
                <span className="font-medium">{selectedThreatActor?.sector || "Not Available"}</span>
              </div>
            </div>

            {/* Bar Chart for Sector Match */}
            <BarChart width={250} height={200} data={[{ name: "Sector Match", score: sectorMatchScore }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 1]} />
              <Bar dataKey="score" fill="#82ca9d" />
            </BarChart>
          </Card>
        </div>

        {/* TEF Calculation Card */}
        <Card className="p-4 mb-8 text-center bg-red-700">
          <h2 className="text-xl font-semibold">Final TEF Calculation</h2>
          <p className="text-white text-lg mb-2">
            TA ({threatAbility.toFixed(2)}) × Motivation ({motivationScore.toFixed(2)}) × Goals ({goalScore.toFixed(2)}) × Location ({locationMatchScore}) × Sector ({sectorMatchScore})
          </p>
          <p className="text-white text-3xl font-bold">{tefValue.toFixed(4)}</p>
        </Card>
      </div>
    </div>
  );
}