"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useAppContext } from "@/context/appcontext";
import { useAuth } from "@/context/authContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Import your API service
import threatActorService from '../services/threatActors'

import ThreatActorCard from '@/components/ThreatActorCard'

import { SOPHISTICATION_LEVELS, RESOURCE_LEVELS,RELEVANCE_LEVELS } from "@/utils/threatActorConsts";

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


function HomeContent() {
  // selecting several ta
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
const [detailMap, setDetailMap]     = useState<Record<string, DetailedThreatActor>>({});
const maxSelect = 10;

  // Backend data state
  const [threatActors, setThreatActors] = useState<ThreatActorSummary[]>([]);
  const [selectedThreatActor, setSelectedThreatActor] = useState<DetailedThreatActor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [orgLocation, setOrgLocation] = useState<string>("U.S.");
  const [orgSector, setOrgSector] = useState<string>("Energy");

  // Weight states
  const [w1, setW1] = useState<number>(0.6);
  const [w2, setW2] = useState<number>(0.4);
  
  // Custom weights for motivations and goals
  const [motivationWeights, setMotivationWeights] = useState<{ [key: string]: number }>({});
  const [goalWeights, setGoalWeights] = useState<{ [key: string]: number }>({});
  const [motivationRelevanceLevels, setMotivationRelevanceLevels] = useState<{ [key: string]: string }>({});
  const [goalRelevanceLevels, setGoalRelevanceLevels] = useState<{ [key: string]: string }>({});

  const { setTefValue } = useAppContext();
  const { user, logout, hasRole } = useAuth();

  // Initialize weights when threat actor changes
  useEffect(() => {
    if (selectedThreatActor) {
      // Initialize motivation weights using backend values
      const initialMotivationWeights: { [key: string]: number } = {};
      const initialMotivationRelevance: { [key: string]: string } = {};
      
      if (selectedThreatActor.motivations.length > 0) {
        selectedThreatActor.motivations.forEach(motivation => {
          initialMotivationWeights[motivation.id] = motivation.weight;
          initialMotivationRelevance[motivation.id] = motivation.relevanceLevel;
        });
      }




      // Initialize goal weights using backend values
      const initialGoalWeights: { [key: string]: number } = {};
      const initialGoalRelevance: { [key: string]: string } = {};
      
       selectedThreatActor.goals.forEach(g => {
      initialGoalWeights[g.id]   = g.weight;
      initialGoalRelevance[g.id] = g.relevanceLevel;
    });
      
      setMotivationWeights(initialMotivationWeights);
      setGoalWeights(initialGoalWeights);
      setMotivationRelevanceLevels(initialMotivationRelevance);
      setGoalRelevanceLevels(initialGoalRelevance);
    }
  }, [selectedThreatActor]);

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

  useEffect(() => {
  const need = selectedIds.filter(id => !detailMap[id]);
  if (!need.length) return;

  Promise.all(need.map(id => threatActorService.getById(id)))
    .then(arr => {
      setDetailMap(prev => {
        const copy = { ...prev };
        arr.forEach(ta => (copy[ta.id] = ta));
        return copy;
      });
    })
    .catch(console.error);
}, [selectedIds]);

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

  // Weight adjustment handlers
  const handleW1Change = (value: number) => {
    const newW1 = value / 100;
    const newW2 = 1 - newW1;
    setW1(newW1);
    setW2(newW2);
  };

  const handleMotivationWeightChange = (id:string, weight:number)=>{
  setMotivationWeights(prev => ({ ...prev, [id]: weight }));
};

const handleGoalWeightChange = (id:string, weight:number)=>{
  setGoalWeights(prev => ({ ...prev, [id]: weight }));
};



  const handleMotivationRelevanceChange = (motivationId: string, relevanceLevel: string) => {
    setMotivationRelevanceLevels(prev => ({
      ...prev,
      [motivationId]: relevanceLevel
    }));
  };

  const handleGoalRelevanceChange = (goalId: string, relevanceLevel: string) => {
    setGoalRelevanceLevels(prev => ({
      ...prev,
      [goalId]: relevanceLevel
    }));
  };

  // Calculations
  const sophisticationValue = selectedThreatActor 
    ? (SOPHISTICATION_LEVELS[selectedThreatActor.sophisticationLevel] || 0)
    : 0;
  
  const resourceValue = selectedThreatActor 
    ? (RESOURCE_LEVELS[selectedThreatActor.resourceLevel] || 0)
    : 0;

  // Calculate motivation scores using custom weights and relevance levels
  const motivationScore = selectedThreatActor 
    ? selectedThreatActor.motivations.reduce((total, motivation) => {
        const customRelevanceLevel = motivationRelevanceLevels[motivation.id] || motivation.relevanceLevel;
        const relevanceValue = RELEVANCE_LEVELS[customRelevanceLevel] || 0;
        const customWeight = motivationWeights[motivation.id] !== undefined ? motivationWeights[motivation.id] : motivation.weight;
        return total + (relevanceValue * customWeight);
      }, 0)
    : 0;

  // Calculate goal scores using custom weights and relevance levels
  const goalScore = selectedThreatActor 
    ? selectedThreatActor.goals.reduce((total, goal) => {
        const customRelevanceLevel = goalRelevanceLevels[goal.id] || goal.relevanceLevel;
        const relevanceValue = RELEVANCE_LEVELS[customRelevanceLevel] || 0;
        const customWeight = goalWeights[goal.id] !== undefined ? goalWeights[goal.id] : goal.weight;
        return total + (relevanceValue * customWeight);
      }, 0)
    : 0;
  
  const locationMatchScore = selectedThreatActor && orgLocation === selectedThreatActor.location ? 1 : 0;
  const sectorMatchScore = selectedThreatActor && orgSector === selectedThreatActor.sector ? 1 : 0;

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
        {/* User Info Section */}
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">{user?.name}</h3>
              <p className="text-sm text-gray-300">{user?.email}</p>
              <span className={`inline-block px-2 py-1 text-xs rounded mt-1 ${
                user?.type === 'admin' ? 'bg-red-600 text-white' :
                user?.type === 'analyst' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
              }`}>
                {user?.type?.toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to logout?')) {
                  logout();
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Navigation</h2>
        <nav className="flex flex-col space-y-4">
          <Link
            href="/"
            className="p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
            Threat Actor Analysis
          </Link>
          <Link
            href="/vulnerabilityanalysis"
            className="p-3 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors">
            Vulnerability Analysis
          </Link>
          <Link
            href="/riskanalysis"
            className="p-3 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors">
            Risk Analysis
          </Link>
          <Link
            href="/securitycontrolsanalysis"
            className="p-3 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors">
            Security Controls Analysis and ROSI Calculation
          </Link>
          
          {/* Admin-only User Management Link */}
          {hasRole(['admin']) && (
            <Link
              href="/users"
              className="p-3 bg-purple-700 text-white rounded-md hover:bg-purple-600 transition-colors border-l-4 border-purple-400">
              <div className="flex items-center justify-between">
                <span>User Management</span>
                <span className="text-xs bg-purple-500 px-2 py-1 rounded">ADMIN</span>
              </div>
            </Link>
          )}
        </nav>

        {/* User Role Info */}
        <div className="mt-6 p-3 bg-gray-700 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Access Level</h4>
          <div className="text-xs text-gray-400">
            {user?.type === 'admin' && (
              <div>
                <p>✓ Full system access</p>
                <p>✓ User management</p>
                <p>✓ All analysis tools</p>
              </div>
            )}
            {user?.type === 'analyst' && (
              <div>
                <p>✓ All analysis tools</p>
                <p>✓ Data modification</p>
                <p>⨯ User management</p>
              </div>
            )}
            {user?.type === 'viewer' && (
              <div>
                <p>✓ View analysis</p>
                <p>⨯ Data modification</p>
                <p>⨯ User management</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6 space-y-8 overflow-y-auto">

        {/* Threat Actors Selection */}
        <Card className="p-4 bg-gray-700 text-white">
  <h2 className="text-xl font-semibold mb-2">
    Pick Threat Actors&nbsp;
    <span className="text-sm">({selectedIds.length}/{maxSelect})</span>
  </h2>
  <div className="flex flex-wrap gap-4">
    {threatActors.map(a => (
      <label key={a.id} className="inline-flex items-center space-x-2">
        <input
          type="checkbox"
          className="form-checkbox text-blue-600"
          checked={selectedIds.includes(a.id)}
          onChange={() =>
            setSelectedIds(prev => {
              const exists = prev.includes(a.id);
              if (exists) return prev.filter(x => x !== a.id);
              if (prev.length >= maxSelect) return prev;
              return [...prev, a.id];
            })
          }
        />
        <span>{a.name}</span>
      </label>
    ))}
  </div>
</Card>

        {/* Weights Section with Sliders */}
        <Card className="p-4 mb-4 bg-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-center text-white">Weight Adjustment</h2>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white">Sophistication Weight (w1): <span className="font-bold text-blue-400">{w1.toFixed(2)}</span></span>
              <span className="text-white">Resource Weight (w2): <span className="font-bold text-green-400">{w2.toFixed(2)}</span></span>
            </div>

            <div className="mb-2">
              <label className="block text-sm text-gray-300 mb-1">
                Sophistication vs Resource Weight (w1 = {w1.toFixed(2)}, w2 = {w2.toFixed(2)})
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={w1 * 100}
                onChange={(e) => handleW1Change(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>All Resource (w2=1.0)</span>
                <span>Balanced</span>
                <span>All Sophistication (w1=1.0)</span>
              </div>
            </div>
          </div>
        </Card>


{/* pull selected threat actor card and display */}
<div className="flex flex-col gap-8">
  {selectedIds.map(id => {
    const ta = detailMap[id];
    if (!ta) return null;            // not loading
    return (
      <ThreatActorCard
        key={id}
        ta={ta}
        orgLoc={orgLocation}
        orgSec={orgSector}
        w1={w1}
        w2={w2}
      />
    );
  })}
</div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute requiredRoles={['viewer', 'analyst', 'admin']}>
      <HomeContent />
    </ProtectedRoute>
  );
}