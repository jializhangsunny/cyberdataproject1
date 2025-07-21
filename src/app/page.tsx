"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { BarChart, Bar, LabelList, XAxis, YAxis, CartesianGrid } from "recharts";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useAppContext } from "@/context/appcontext";
import { useAuth } from "@/context/authContext";
import { useUserPreferences } from "@/context/userPreferencesContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Check, X } from 'lucide-react';
import { HelpCircle } from 'lucide-react';
import OnboardingTour from "@/components/OnboardingTour";
import type { StepType } from "@reactour/tour";



// Import your API service
import threatActorService from '../services/threatActors';

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

interface Motivation {
  motivationId: {
    id: string,
    name: string
  },
  weight: number,
  relevanceLevel: string
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

const tasteps : StepType[]= [
  {
    selector: "#tour-select-threat-actor",
    content: "Select a threat actor to analyse.",
    position: "bottom",
  },
  {
    selector: "#tour-threat-ability",
    content: " Adjust the weights and inspect the Threat-Ability gauge.",
    position: "top",
  },
  {
    selector: "#tour-location-sector",
    content: " Choose your organisation’s location & sector to see the match.",
    position: "top",
  },
  {
    selector: "#tour-tef-value",
    content: "Here you’ll find the composite TEF risk score.",
    position: "top",
  },
];

//add function match to show icon
function MatchIcon({ matched }: { matched: boolean }) {
  return matched ? (
    <Check className="text-red-400 w-8 h-8" strokeWidth={3} />
  ) : (
    <X className="text-green-300 w-8 h-8" strokeWidth={3} />
  );
}

function HomeContent() {
  // Backend data state
  const [threatActors, setThreatActors] = useState<ThreatActorSummary[]>([]);
  const [selectedThreatActor, setSelectedThreatActor] = useState<DetailedThreatActor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  // const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const [hasCheckedFirstTime, setHasCheckedFirstTime] = useState(false);

  // Form state - these will be synced with user preferences
  const [orgLocation, setOrgLocation] = useState<string>("U.S.");
  const [orgSector, setOrgSector] = useState<string>("Energy");

  // Get user preferences context
  const {
    preferences,
    loading: preferencesLoading,
    error: preferencesError,
    hasLoadedAllPreferences,
    updatePreferences,
    loadPreferencesForThreatActor,
    loadAllUserPreferences,
    sophisticationWeight,
    resourceWeight,
    motivationAnalysis,
    goalsAnalysis: contextGoalsAnalysis,
    isFirstTimeUser
  } = useUserPreferences();

  const isSaving = useRef(false);

  const { setTefValue, selectedThreatActorId, setSelectedThreatActorId } = useAppContext();
  const { user, logout, hasRole } = useAuth();

  // Load preferences when threat actor changes
  useEffect(() => {
    if (user?.id && selectedThreatActorId) {
      loadPreferencesForThreatActor(user.id, selectedThreatActorId);
    }
  }, [user?.id, selectedThreatActorId]); // Removed loadPreferencesForThreatActor from dependencies

  useEffect(() => {
    if (user?.id) {
      loadAllUserPreferences(user.id);
    }
  }, [user?.id, loadAllUserPreferences]);

  // Local state for immediate UI updates (will be saved to preferences on SAVE)
  const [localW1, setLocalW1] = useState<number>(0.5);
  const [localW2, setLocalW2] = useState<number>(0.5);
  const [localMotivationWeights, setLocalMotivationWeights] = useState<{ [key: string]: number }>({});
  const [localGoalWeights, setLocalGoalWeights] = useState<{ [key: string]: number }>({});
  const [localMotivationRelevanceLevels, setLocalMotivationRelevanceLevels] = useState<{ [key: string]: string }>({});
  const [localGoalRelevanceLevels, setLocalGoalRelevanceLevels] = useState<{ [key: string]: string }>({});


  useEffect(() => {
    setOrgLocation(user?.organization?.location || "U.S.");
    setOrgSector(user?.organization?.sector || "Energy");
  }, [user]);

  useEffect(() => {
    if (selectedThreatActor && !isSaving.current) {
      // Initialize all motivation weights if not already set
      const newMotivationWeights = { ...localMotivationWeights };
      let hasChanges = false;
      
      selectedThreatActor.motivations.forEach(motivation => {
        if (newMotivationWeights[motivation.id] === undefined) {
          newMotivationWeights[motivation.id] = motivation.weight || (1.0 / selectedThreatActor.motivations.length);
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        setLocalMotivationWeights(newMotivationWeights);
      }
      
      // Same for goals
      const newGoalWeights = { ...localGoalWeights };
      hasChanges = false;
      
      selectedThreatActor.goals.forEach(goal => {
        if (newGoalWeights[goal.id] === undefined) {
          newGoalWeights[goal.id] = goal.weight || (1.0 / selectedThreatActor.goals.length);
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        setLocalGoalWeights(newGoalWeights);
      }
    }
  }, [selectedThreatActor?.id]);

  useEffect(() => {
    if (!isSaving.current && preferences && selectedThreatActor) {
      // Fix: Use threatActorId.id instead of threatActorId
      if (preferences.threatActorId?.id === selectedThreatActor.id && 
          motivationAnalysis.length > 0 && 
          contextGoalsAnalysis.length > 0) {
        
        // Update local state with the loaded preference values
        const motivationWeights: { [key: string]: number } = {};
        const motivationRelevance: { [key: string]: string } = {};
        motivationAnalysis.forEach((motivation: any) => {
          motivationWeights[motivation.motivationId] = motivation.weight;
          motivationRelevance[motivation.motivationId] = motivation.relevanceLevel;
          console.log(`Setting motivation ${motivation.motivationId}: weight=${motivation.weight}, relevance=${motivation.relevanceLevel}`);
        });
        
        const goalWeights: { [key: string]: number } = {};
        const goalRelevance: { [key: string]: string } = {};
        contextGoalsAnalysis.forEach((goal: any) => {
          goalWeights[goal.goalId] = goal.weight;
          goalRelevance[goal.goalId] = goal.relevanceLevel;
          console.log(`Setting goal ${goal.goalId}: weight=${goal.weight}, relevance=${goal.relevanceLevel}`);
        });
        
        setLocalMotivationWeights(motivationWeights);
        setLocalGoalWeights(goalWeights);
        setLocalMotivationRelevanceLevels(motivationRelevance);
        setLocalGoalRelevanceLevels(goalRelevance);
        setLocalW1(sophisticationWeight);
        setLocalW2(resourceWeight);
      }
    }
  }, [preferences?.updatedAt, selectedThreatActor?.id, motivationAnalysis.length, contextGoalsAnalysis.length]);

  // Separate effect for when preferences are loaded/updated
  useEffect(() => {
    if (preferences && motivationAnalysis.length > 0 && contextGoalsAnalysis.length > 0 && !isSaving.current) {
      // Update local state with the loaded preference values
      const motivationWeights: { [key: string]: number } = {};
      const motivationRelevance: { [key: string]: string } = {};
      motivationAnalysis.forEach((motivation: any) => {
        motivationWeights[motivation.motivationId] = motivation.weight;
        motivationRelevance[motivation.motivationId] = motivation.relevanceLevel;
      });
      
      const goalWeights: { [key: string]: number } = {};
      const goalRelevance: { [key: string]: string } = {};
      contextGoalsAnalysis.forEach((goal: any) => {
        goalWeights[goal.goalId] = goal.weight;
        goalRelevance[goal.goalId] = goal.relevanceLevel;
      });
      
      setLocalMotivationWeights(motivationWeights);
      setLocalGoalWeights(goalWeights);
      setLocalMotivationRelevanceLevels(motivationRelevance);
      setLocalGoalRelevanceLevels(goalRelevance);
      setLocalW1(sophisticationWeight);
      setLocalW2(resourceWeight);
    }
  }, [preferences?.updatedAt]); // Only when preferences actually change



  // Fetch all threat actors on component mount
  useEffect(() => {
    const fetchThreatActors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await threatActorService.getAll();
        setThreatActors(data);
        
        // Use first threat actor as default
        if (data.length > 0 && !selectedThreatActorId) {
          setSelectedThreatActorId(data[0].id);
          await loadThreatActorDetails(data[0].id);
        } else if (selectedThreatActorId) {
          await loadThreatActorDetails(selectedThreatActorId);
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

  // Load threat actor details and preferences when selection changes
  useEffect(() => {
    if (selectedThreatActorId && threatActors.length > 0) {
      const loadDetails = async () => {
        await loadThreatActorDetails(selectedThreatActorId);
      };
      loadDetails();
    }
  }, [selectedThreatActorId, threatActors.length]); // Removed loadThreatActorDetails from dependencies

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
    setSelectedThreatActorId(threatActorId);
    await loadThreatActorDetails(threatActorId);
    // Preferences will be loaded by the useEffect that watches selectedThreatActorId
  }, [setSelectedThreatActorId]); // Removed loadThreatActorDetails from dependencies

  // Weight adjustment handlers (local updates only)
  const handleW1Change = (value: number) => {
    const newW1 = value / 100;
    const newW2 = 1 - newW1;
    setLocalW1(newW1);
    setLocalW2(newW2);
  };

  // const handleMotivationWeightChange = (motivationId: string, value: number) => {
  //   if (!selectedThreatActor) return;
    
  //   const newWeight = value / 100;
  //   const otherMotivations = selectedThreatActor.motivations.filter(m => m.id !== motivationId);
    
  //   if (otherMotivations.length === 0) {
  //     setLocalMotivationWeights({ [motivationId]: 1.0 });
  //     return;
  //   }
    
  //   const remainingWeight = 1.0 - newWeight;
  //   const weightPerOther = remainingWeight / otherMotivations.length;
    
  //   const newWeights = { ...localMotivationWeights };
  //   newWeights[motivationId] = newWeight;
    
  //   otherMotivations.forEach(motivation => {
  //     newWeights[motivation.id] = weightPerOther;
  //   });
    
  //   setLocalMotivationWeights(newWeights);
  // };
  const handleMotivationWeightChange = (motivationId: string, value: number) => {
    if (!selectedThreatActor) return;
    
    const newWeight = value / 100;
    const oldWeight = localMotivationWeights[motivationId] || 0;
    const weightDifference = newWeight - oldWeight;
    
    const otherMotivations = selectedThreatActor.motivations.filter(m => m.id !== motivationId);
    
    if (otherMotivations.length === 0) {
      setLocalMotivationWeights({ [motivationId]: 1.0 });
      return;
    }
    
    // Calculate total weight of other motivations
    const totalOtherWeight = otherMotivations.reduce((sum, m) => 
      sum + (localMotivationWeights[m.id] || 0), 0
    );
    
    const newWeights = { ...localMotivationWeights };
    newWeights[motivationId] = newWeight;
    
    // Redistribute the difference proportionally
    if (totalOtherWeight > 0) {
      otherMotivations.forEach(motivation => {
        const currentWeight = localMotivationWeights[motivation.id] || 0;
        const proportion = currentWeight / totalOtherWeight;
        newWeights[motivation.id] = Math.max(0, currentWeight - (weightDifference * proportion));
      });
    } else {
      // If all others are 0, distribute equally
      const weightPerOther = (1 - newWeight) / otherMotivations.length;
      otherMotivations.forEach(motivation => {
        newWeights[motivation.id] = weightPerOther;
      });
    }
    
    // Normalize to ensure sum = 1
    const sum = Object.values(newWeights).reduce((a, b) => a + b, 0);
    if (sum > 0) {
      Object.keys(newWeights).forEach(key => {
        newWeights[key] = newWeights[key] / sum;
      });
    }
    
    setLocalMotivationWeights(newWeights);
  };

  const handleGoalWeightChange = (goalId: string, value: number) => {
    if (!selectedThreatActor) return;
    
    const newWeight = value / 100;
    const otherGoals = selectedThreatActor.goals.filter(g => g.id !== goalId);
    
    if (otherGoals.length === 0) {
      setLocalGoalWeights({ [goalId]: 1.0 });
      return;
    }
    
    const remainingWeight = 1.0 - newWeight;
    const weightPerOther = remainingWeight / otherGoals.length;
    
    const newWeights = { ...localGoalWeights };
    newWeights[goalId] = newWeight;
    
    otherGoals.forEach(goal => {
      newWeights[goal.id] = weightPerOther;
    });
    
    setLocalGoalWeights(newWeights);
  };

  const handleMotivationRelevanceChange = (motivationId: string, relevanceLevel: string) => {
    setLocalMotivationRelevanceLevels(prev => ({
      ...prev,
      [motivationId]: relevanceLevel
    }));
  };

  const handleGoalRelevanceChange = (goalId: string, relevanceLevel: string) => {
    setLocalGoalRelevanceLevels(prev => ({
      ...prev,
      [goalId]: relevanceLevel
    }));
  };

  // Update the save handler to prevent reset during save
const handleSavePreferences = async () => {
  if (!selectedThreatActor || !user?.id) return;
  
  setSaveLoading(true);
  isSaving.current = true; // Prevent useEffect from resetting during save
  
  try {
    // Prepare motivation analysis data
    const motivationAnalysis = selectedThreatActor.motivations.map(motivation => ({
      motivationId: motivation.id,
      relevanceLevel: localMotivationRelevanceLevels[motivation.id] || motivation.relevanceLevel,
      weight: localMotivationWeights[motivation.id] !== undefined ? localMotivationWeights[motivation.id] : motivation.weight
    }));

    // Prepare goals analysis data
    const goalsAnalysis = selectedThreatActor.goals.map(goal => ({
      goalId: goal.id,
      relevanceLevel: localGoalRelevanceLevels[goal.id] || goal.relevanceLevel,
      weight: localGoalWeights[goal.id] !== undefined ? localGoalWeights[goal.id] : goal.weight
    }));

    // Update preferences for this specific threat actor
    await updatePreferences({
      sophisticationResourceWeights: {
        sophisticationWeight: localW1,
        resourceWeight: localW2
      },
      motivationAnalysis,
      goalsAnalysis
    });

    // Hide welcome banner after successful save (user is no longer first-time)
    // setShowWelcomeBanner(false);
    
    alert('Preferences saved successfully for ' + selectedThreatActor.name + '!');
  } catch (err) {
    console.error('Failed to save preferences:', err);
    alert('Failed to save preferences. Please try again.');
  } finally {
    setSaveLoading(false);
    // Small delay to ensure context has updated before allowing resets
    setTimeout(() => {
      isSaving.current = false;
    }, 100);
  }
};

  // Calculations using local state
  const sophisticationValue = selectedThreatActor 
    ? (SOPHISTICATION_LEVELS[selectedThreatActor.sophisticationLevel] || 0)
    : 0;
  
  const resourceValue = selectedThreatActor 
    ? (RESOURCE_LEVELS[selectedThreatActor.resourceLevel] || 0)
    : 0;


  // Debug: Log the actual state values
console.log("=== DEBUG TEF Calculation ===");
console.log("localMotivationRelevanceLevels:", localMotivationRelevanceLevels);
console.log("localGoalRelevanceLevels:", localGoalRelevanceLevels);

if (selectedThreatActor) {
  console.log("\n--- Motivation Values ---");
  selectedThreatActor.motivations.forEach(motivation => {
    const idStr = String(motivation.id);
    const localRelevance = localMotivationRelevanceLevels[idStr];
    const defaultRelevance = motivation.relevanceLevel;
    const usedRelevance = localRelevance || defaultRelevance || "Moderate";
    
    console.log(`${motivation.name} (${motivation.id}):`, {
      localRelevance,
      defaultRelevance,
      usedRelevance,
      relevanceValue: RELEVANCE_LEVELS[usedRelevance]
    });
  });
}
  // Calculate motivation scores using local weights and relevance levels
  // Calculate motivation scores - ensure consistent defaults
const motivationScore = selectedThreatActor 
  ? selectedThreatActor.motivations.reduce((total, motivation) => {
      // Handle both cases: with and without preferences
      let idStr;
      let relevanceLevel;
      let weight;
      
      if (motivationAnalysis.length > 0) {
        // When preferences exist, find the matching motivation
        const prefMotivation = motivationAnalysis.find((m: any) => 
          m.motivationId.name === motivation.name || 
          m.motivationId.id === motivation.id
        );
        
        if (prefMotivation) {
          idStr = String(prefMotivation.motivationId.id);
          relevanceLevel = localMotivationRelevanceLevels[idStr] || prefMotivation.relevanceLevel || "Moderate";
          weight = localMotivationWeights[idStr] !== undefined 
            ? localMotivationWeights[idStr] 
            : prefMotivation.weight;
        } else {
          // Fallback if not found in preferences
          idStr = String(motivation.id);
          relevanceLevel = localMotivationRelevanceLevels[idStr] || motivation.relevanceLevel || "Moderate";
          weight = localMotivationWeights[idStr] !== undefined 
            ? localMotivationWeights[idStr] 
            : motivation.weight || (1.0 / selectedThreatActor.motivations.length);
        }
      } else {
        // No preferences - use threat actor data directly
        idStr = String(motivation.id);
        relevanceLevel = localMotivationRelevanceLevels[idStr] || motivation.relevanceLevel || "Moderate";
        weight = localMotivationWeights[idStr] !== undefined 
          ? localMotivationWeights[idStr] 
          : motivation.weight || (1.0 / selectedThreatActor.motivations.length);
      }
      
      const relevanceValue = RELEVANCE_LEVELS[relevanceLevel] || 0;
      
      console.log(`Calc ${motivation.name}:`, { idStr, relevanceLevel, relevanceValue, weight });
      
      return total + (relevanceValue * weight);
    }, 0)
  : 0;

// Calculate goal scores - ensure consistent defaults
const goalScore = selectedThreatActor 
  ? selectedThreatActor.goals.reduce((total, goal) => {
      let idStr;
      let relevanceLevel;
      let weight;
      
      if (contextGoalsAnalysis.length > 0) {
        const prefGoal = contextGoalsAnalysis.find((g:any) => 
          g.goalId.name === goal.name || 
          g.goalId.id === goal.id
        );
        
        if (prefGoal) {
          idStr = String(prefGoal.goalId.id);
          relevanceLevel = localGoalRelevanceLevels[idStr] || prefGoal.relevanceLevel || "Moderate";
          weight = localGoalWeights[idStr] !== undefined 
            ? localGoalWeights[idStr] 
            : prefGoal.weight;
        } else {
          idStr = String(goal.id);
          relevanceLevel = localGoalRelevanceLevels[idStr] || goal.relevanceLevel || "Moderate";
          weight = localGoalWeights[idStr] !== undefined 
            ? localGoalWeights[idStr] 
            : goal.weight || (1.0 / selectedThreatActor.goals.length);
        }
      } else {
        idStr = String(goal.id);
        relevanceLevel = localGoalRelevanceLevels[idStr] || goal.relevanceLevel || "Moderate";
        weight = localGoalWeights[idStr] !== undefined 
          ? localGoalWeights[idStr] 
          : goal.weight || (1.0 / selectedThreatActor.goals.length);
      }
      
      const relevanceValue = RELEVANCE_LEVELS[relevanceLevel] || 0;
      return total + (relevanceValue * weight);
    }, 0)
  : 0;

  // Add this after your calculations
  // const motivationWeightSum = selectedThreatActor?.motivations.reduce((sum, m) => 
  //   sum + (localMotivationWeights[m.id] || 0), 0) || 0;

  // const goalWeightSum = selectedThreatActor?.goals.reduce((sum, g) => 
  //   sum + (localGoalWeights[g.id] || 0), 0) || 0;

  // console.log('Weight sums:', { motivationWeightSum, goalWeightSum });

  // // Calculate goal scores using local weights and relevance levels
  // const goalScore = selectedThreatActor 
  //   ? selectedThreatActor.goals.reduce((total, goal) => {
  //       const customRelevanceLevel = localGoalRelevanceLevels[goal.id] || goal.relevanceLevel;
  //       const relevanceValue = RELEVANCE_LEVELS[customRelevanceLevel] || 0;
  //       const customWeight = localGoalWeights[goal.id] !== undefined ? localGoalWeights[goal.id] : goal.weight;
  //       return total + (relevanceValue * customWeight);
  //     }, 0)
  //   : 0;
  
  const locationMatchScore = selectedThreatActor && orgLocation === selectedThreatActor.location ? 1 : 0;
  const sectorMatchScore = selectedThreatActor && orgSector === selectedThreatActor.sector ? 1 : 0;

  const threatAbility = sophisticationValue * localW1 + resourceValue * localW2;

  const tefValue = threatAbility * motivationScore * goalScore * locationMatchScore * sectorMatchScore;

  useEffect(() => {
    setTefValue(tefValue);
  }, [tefValue, setTefValue]);

  // Loading state
  if ((loading && threatActors.length === 0) || preferencesLoading) {
    return (
      <div className="flex h-screen bg-gray-900 text-white items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  // Error state
  if ((error && threatActors.length === 0) || preferencesError) {
    return (
      <div className="flex h-screen bg-gray-900 text-white items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-red-500 mb-4">Error: {error || preferencesError}</div>
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

      {/* Welcome Banner for First Time Users */}
      {/* {showWelcomeBanner && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 z-50 shadow-lg border-b-4 border-blue-400">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-800 rounded-full p-3 flex-shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold">Welcome to Threat Actor Analysis! 🎉</h3>
                <p className="text-sm text-blue-100">
                  This is your first time using the system. Start by selecting a threat actor, then adjust weights and save your preferences.
                </p>
              </div>
            </div>
            <button 
              onClick={() => {
                setShowWelcomeBanner(false);
              }}
              className="bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 flex-shrink-0 ml-4"
              title="Dismiss welcome message"
            >
              <span>Got it!</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )} */}

      {/* Sidebar Navigation */}
      <div className="w-1/4 bg-gray-800 p-6">
        {/* User Info Section */}

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


          {/* Admin-only User Management Link */}
          {/* {hasRole(['admin']) && (
            <Link
              href="/users"
              className="p-3 bg-purple-700 text-white rounded-md hover:bg-purple-600 transition-colors border-l-4 border-purple-400">
              <div className="flex items-center justify-between">
                <span>User Management</span>
                <span className="text-xs bg-purple-500 px-2 py-1 rounded">ADMIN</span>
              </div>
            </Link>
          )} */}
        </nav>

        {/* User Role Info */}
        {/* <div className="mt-6 p-3 bg-gray-700 rounded-lg">
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
        </div> */}
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6 space-y-8 overflow-y-auto">
        {threatActors.length > 0 && (
          <Card id="tour-select-threat-actor"
                className="p-4 bg-gray-800">
            <h2 className="text-xl font-semibold mb-2 text-white">Select Threat Actor</h2>
            <Select onValueChange={handleThreatActorChange} value={selectedThreatActorId || ""}>
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
            <h2 className="text-xl font-semibold">Sophistication Level</h2>
            <div className="w-full p-3 border rounded-md bg-gray-700 text-white">
              <span className="font-medium">{selectedThreatActor?.sophisticationLevel || "Not Available"}</span>
            </div>
           <div className="flex justify-center ">
  <BarChart
    width={450}
    height={60}
    data={[{
      name: 'score',
      value: sophisticationValue,
      remain: 1 - sophisticationValue,
    }]}
    layout="vertical"
    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
  >
    <XAxis type="number" domain={[0, 1]} hide />
    <YAxis type="category" dataKey="name" hide />
    <Bar
      dataKey="value"
      stackId="a"
      fill="#5b8df6"
      isAnimationActive={false}
      radius={[4, 0, 0, 4]}
    >
      <LabelList
        dataKey="value"
        position="center"
        formatter={(v: number) => v.toFixed(3)}
        fill="#fff"
      />
    </Bar>

    <Bar
      dataKey="remain"
      stackId="a"
      fill="#a4c4ff"
      isAnimationActive={false}
      radius={[0, 4, 4, 0]}
    />
  </BarChart>
</div>
          </Card>

          {/* Resource Level */}
          <Card className="p-4 w-1/2">
            <h2 className="text-xl font-semibold">Resource Level</h2>
            <div className="w-full p-3 border rounded-md bg-gray-700 text-white">
              <span className="font-medium">{selectedThreatActor?.resourceLevel || "Not Available"}</span>
            </div>
<div className="flex justify-center ">
  <BarChart
    width={450}
    height={60}
    data={[{
      name: 'score',
      value: resourceValue,
      remain: 1 - resourceValue,
    }]}
    layout="vertical"
    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
  >
     <XAxis type="number" domain={[0, 1]} hide />
    <YAxis type="category" dataKey="name" hide />
    <Bar
      dataKey="value"
      stackId="a"
      fill="#5b8df6"
      isAnimationActive={false}
      radius={[4, 0, 0, 4]}
    >
      <LabelList
        dataKey="value"
        position="center"
        formatter={(v: number) => v.toFixed(3)}
        fill="#fff"
      />
    </Bar>

    <Bar
      dataKey="remain"
      stackId="a"
      fill="#a4c4ff"
      isAnimationActive={false}
      radius={[0, 4, 4, 0]}
    />
  </BarChart>
</div>
          </Card>
        </div>

        {/* Weights Section with Sliders */}
        <Card id="tour-threat-ability" className="p-4 mb-4 bg-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-center text-white">Weight Adjustment</h2>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white">Sophistication Weight (w1): <span className="font-bold text-blue-400">{localW1.toFixed(2)}</span></span>
              <span className="text-white">Resource Weight (w2): <span className="font-bold text-green-400">{localW2.toFixed(2)}</span></span>
            </div>
            
            <div className="mb-2">
              <label className="block text-sm text-gray-300 mb-1">
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={localW1 * 100}
                onChange={(e) => handleW1Change(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </Card>

        {/* Threat Ability Calculation */}
        <Card className="p-4 mb-8 text-center bg-red-700">
          <h2 className="text-xl font-semibold">Threat Ability (TA)</h2>
          <p className="text-white text-lg mb-2">
            {sophisticationValue.toFixed(3)} × {localW1.toFixed(2)} + {resourceValue.toFixed(3)} × {localW2.toFixed(2)}
          </p>
          <p className="text-white text-2xl font-bold mt-2">{threatAbility.toFixed(2)}</p>
        </Card>

        {/* Motivation Analysis and Goals Analysis */}
        <div className="flex justify-between space-x-8 mb-8">
          {/* Motivation Analysis */}
          <Card className="p-4 flex-1 bg-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-white">Motivation Analysis</h2>
            
            {motivationAnalysis.length === 0 ? (
              // NO PREFERENCES - Show threat actor motivations with defaults
              selectedThreatActor?.motivations && selectedThreatActor.motivations.length > 0 ? (
                <div className="space-y-4">
                  {selectedThreatActor.motivations.map((motivation, index) => {
                    const motivationIdStr = String(motivation.id);
                    const defaultWeight = 1.0 / selectedThreatActor.motivations.length;
                    const currentWeight = localMotivationWeights[motivationIdStr] !== undefined ? localMotivationWeights[motivationIdStr] : defaultWeight;
                    const currentRelevance = localMotivationRelevanceLevels[motivationIdStr] || "Moderate";
                    const score = (RELEVANCE_LEVELS[currentRelevance] || 0) * currentWeight;
                    
                    return (
                      <div key={motivation.id} className="p-4 bg-gray-700 rounded-md">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium text-white">{motivation.name}</span>
                          <span className="text-sm text-gray-300">Score: {score.toFixed(3)}</span>
                        </div>
                        
                        {/* Relevance Level Selector */}
                        <div className="mb-3">
                          <label className="block text-sm text-gray-300 mb-1">Relevance Level</label>
                          <Select 
                            onValueChange={(value) => handleMotivationRelevanceChange(motivationIdStr, value)} 
                            value={currentRelevance}
                          >
                            <SelectTrigger className="w-full p-2 border rounded-md bg-white text-black">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(RELEVANCE_LEVELS).map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level} ({RELEVANCE_LEVELS[level]})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Weight Slider */}
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">
                            Weight: {currentWeight.toFixed(3)} (Slider: {(currentWeight * 100).toFixed(0)})
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={currentWeight * 100}
                            onChange={(e) => handleMotivationWeightChange(motivationIdStr, Number(e.target.value))}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-gray-400">No motivations available</div>
              )
            ) : (
              // HAS PREFERENCES - Show motivationAnalysis directly
              <div className="space-y-4">
                {motivationAnalysis.map((motivation: Motivation, index: number) => {
                  const motivationIdStr = String(motivation.motivationId.id);
                  const currentWeight = localMotivationWeights[motivationIdStr] !== undefined ? localMotivationWeights[motivationIdStr] : motivation.weight;
                  const currentRelevance = localMotivationRelevanceLevels[motivationIdStr] || motivation.relevanceLevel;
                  const score = (RELEVANCE_LEVELS[currentRelevance] || 0) * currentWeight;
                  
                  return (
                    <div key={motivation.motivationId.id} className="p-4 bg-gray-700 rounded-md">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-white">{motivation.motivationId.name}</span>
                        <span className="text-sm text-gray-300">Score: {score.toFixed(3)}</span>
                      </div>
                      
                      {/* Relevance Level Selector */}
                      <div className="mb-3">
                        <label className="block text-sm text-gray-300 mb-1">Relevance Level</label>
                        <Select 
                          onValueChange={(value) => handleMotivationRelevanceChange(motivationIdStr, value)} 
                          value={currentRelevance}
                        >
                          <SelectTrigger className="w-full p-2 border rounded-md bg-white text-black">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(RELEVANCE_LEVELS).map((level) => (
                              <SelectItem key={level} value={level}>
                                {level} ({RELEVANCE_LEVELS[level]})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Weight Slider */}
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">
                          Weight: {currentWeight.toFixed(3)} (Slider: {(currentWeight * 100).toFixed(0)})
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={currentWeight * 100}
                          onChange={(e) => handleMotivationWeightChange(motivationIdStr, Number(e.target.value))}
                          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Total Motivation Score */}
            <Card className="p-4 text-center bg-gray-900 mt-4">
              <h3 className="text-lg text-white font-semibold">Total Motivation Score</h3>
              <p className="text-white text-2xl font-bold mt-2">{motivationScore.toFixed(3)}</p>
            </Card>
          </Card>

          {/* Goals Analysis */}
          <Card className="p-4 flex-1 bg-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-white">Goals Analysis</h2>

            {contextGoalsAnalysis.length === 0 ? (
              // NO PREFERENCES - Show threat actor goals with defaults
              selectedThreatActor?.goals && selectedThreatActor.goals.length > 0 ? (
                <div className="space-y-4">
                  {selectedThreatActor.goals.map((goal, index) => {
                    const goalIdStr = String(goal.id);
                    const defaultWeight = 1.0 / selectedThreatActor.goals.length;
                    const currentWeight = localGoalWeights[goalIdStr] !== undefined ? localGoalWeights[goalIdStr] : defaultWeight;
                    const currentRelevance = localGoalRelevanceLevels[goalIdStr] || "Moderate";
                    const score = (RELEVANCE_LEVELS[currentRelevance] || 0) * currentWeight;
                    
                    return (
                      <div key={goal.id} className="p-4 bg-gray-700 rounded-md">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium text-white">{goal.name}</span>
                          <span className="text-sm text-gray-300">Score: {score.toFixed(3)}</span>
                        </div>
                        
                        {/* Relevance Level Selector */}
                        <div className="mb-3">
                          <label className="block text-sm text-gray-300 mb-1">Relevance Level</label>
                          <Select 
                            onValueChange={(value) => handleGoalRelevanceChange(goalIdStr, value)} 
                            value={currentRelevance}
                          >
                            <SelectTrigger className="w-full p-2 border rounded-md bg-white text-black">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(RELEVANCE_LEVELS).map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level} ({RELEVANCE_LEVELS[level]})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Weight Slider */}
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">
                            Weight: {currentWeight.toFixed(3)}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={currentWeight * 100}
                            onChange={(e) => handleGoalWeightChange(goalIdStr, Number(e.target.value))}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-gray-400">No goals available</div>
              )
            ) : (
              // HAS PREFERENCES - Show contextGoalsAnalysis directly
              <div className="space-y-4">
                {contextGoalsAnalysis.map((goal: any, index: number) => {
                  const goalIdStr = String(goal.goalId.id);
                  const currentWeight = localGoalWeights[goalIdStr] !== undefined ? localGoalWeights[goalIdStr] : goal.weight;
                  const currentRelevance = localGoalRelevanceLevels[goalIdStr] || goal.relevanceLevel;
                  const score = (RELEVANCE_LEVELS[currentRelevance] || 0) * currentWeight;
                  
                  return (
                    <div key={goal.goalId.id} className="p-4 bg-gray-700 rounded-md">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-white">{goal.goalId.name}</span>
                        <span className="text-sm text-gray-300">Score: {score.toFixed(3)}</span>
                      </div>
                      
                      {/* Relevance Level Selector */}
                      <div className="mb-3">
                        <label className="block text-sm text-gray-300 mb-1">Relevance Level</label>
                        <Select 
                          onValueChange={(value) => handleGoalRelevanceChange(goalIdStr, value)} 
                          value={currentRelevance}
                        >
                          <SelectTrigger className="w-full p-2 border rounded-md bg-white text-black">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(RELEVANCE_LEVELS).map((level) => (
                              <SelectItem key={level} value={level}>
                                {level} ({RELEVANCE_LEVELS[level]})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Weight Slider */}
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">
                          Weight: {currentWeight.toFixed(3)}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={currentWeight * 100}
                          onChange={(e) => handleGoalWeightChange(goalIdStr, Number(e.target.value))}
                          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Total Goal Score */}
            <Card className="p-4 text-center bg-gray-900 mt-4">
              <h3 className="text-lg text-white font-semibold">Total Goal Score</h3>
              <p className="text-white text-2xl font-bold mt-2">{goalScore.toFixed(3)}</p>
            </Card>
          </Card>
        </div>

        {/* Location and Sector Match Row */}
        <div id="tour-location-sector" className="flex justify-between space-x-8 mb-8">
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

            {/* UI for Location Match */}
            <div className="flex items-center justify-center space-x-3 mt-2">
              <MatchIcon matched={locationMatchScore === 1} />
                          <span
                className={`text-2xl font-semibold ${
                  locationMatchScore === 1 ? 'text-red-500' : 'text-green-500'
    }`}
  >
    {locationMatchScore}
  </span>
</div>
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
             <div className="flex items-center justify-center space-x-3 mt-2">
  <MatchIcon matched={sectorMatchScore === 1} />
              <span
    className={`text-2xl font-semibold ${
      sectorMatchScore === 1 ? 'text-red-500' : 'text-green-500'}`}
  >
    {sectorMatchScore}
  </span>
</div>
          </Card>
        </div>

        {/* TEF Calculation Card */}
        <Card id="tour-tef-value" className="p-4 mb-8 text-center bg-red-700">
          <h2 className="text-xl font-semibold">Final TEF Calculation</h2>
          <p className="text-white text-lg mb-2">
            TA ({threatAbility.toFixed(3)}) × Motivation ({motivationScore.toFixed(3)}) × Goals ({goalScore.toFixed(3)}) × Location ({locationMatchScore}) × Sector ({sectorMatchScore})
          </p>
          <p className="text-white text-3xl font-bold">{tefValue.toFixed(3)}</p>
        </Card>

        {/* Save Preferences Button */}
        <Card className="p-6 bg-green-800 border-green-600">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">Save Your Preferences</h2>
            <p className="text-green-100 mb-6">
              Save your current weight adjustments and relevance levels for <strong>{selectedThreatActor?.name}</strong>. 
              These preferences will be specific to this threat actor and preserved for future sessions.
            </p>
            
            <button
              onClick={handleSavePreferences}
              disabled={saveLoading || !selectedThreatActor}
              className={`px-8 py-4 text-xl font-semibold rounded-lg transition-all duration-200 ${
                saveLoading || !selectedThreatActor
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-500 text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
            >
              {saveLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Saving...
                </div>
              ) : (
                'SAVE PREFERENCES'
              )}
            </button>
            
            {!selectedThreatActor && (
              <p className="text-sm text-red-300 mt-2">
                Please select a threat actor before saving preferences.
              </p>
            )}
          </div>
        </Card>

        {/* Preferences Status */}
        {preferences && (
          <Card className="p-4 bg-gray-800 border-gray-600">
            <h3 className="text-lg font-semibold text-white mb-2">Current Preferences Status for {selectedThreatActor?.name}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-300">Sophistication Weight:</span>
                <span className="text-white ml-2">{sophisticationWeight.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-300">Resource Weight:</span>
                <span className="text-white ml-2">{resourceWeight.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-300">Threat Actor:</span>
                <span className="text-white ml-2">{selectedThreatActor?.name || 'None'}</span>
              </div>
              <div>
                <span className="text-gray-300">Has Preferences:</span>
                <span className="text-white ml-2">{preferences.threatActorId ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-gray-300">Motivations Configured:</span>
                <span className="text-white ml-2">{motivationAnalysis.length}</span>
              </div>
              <div>
                <span className="text-gray-300">Goals Configured:</span>
                <span className="text-white ml-2">{contextGoalsAnalysis.length}</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-400">
              Last updated: {preferences.updatedAt ? new Date(preferences.updatedAt).toLocaleString() : 'Never'}
            </div>
          </Card>
        )}
      </div>


      <OnboardingTour steps={tasteps} storageKey="tour_done_ta" />

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
