"use client";
// context/userPreferencesContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import userPreferencesService from '../services/userPreferences';
import { useAuth } from './authContext';

const UserPreferencesContext = createContext();

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};

export const UserPreferencesProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentPreferences, setCurrentPreferences] = useState(null);
  const [allPreferences, setAllPreferences] = useState([]);
  const [currentThreatActorId, setCurrentThreatActorId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [hasLoadedAllPreferences, setHasLoadedAllPreferences] = useState(false);
  const [hasAnyPreferences, setHasAnyPreferences] = useState(false);

  const loadPreferencesForThreatActor = useCallback(async (userId, threatActorId) => {
  if (!userId || !threatActorId) return;
  
  setLoading(true);
  setError(null);
  try {
    const data = await userPreferencesService.getUserPreferences(userId, threatActorId);
    setCurrentPreferences(data);
    setCurrentThreatActorId(threatActorId);
    
    // If we haven't loaded all preferences yet, do a quick check
    if (!hasLoadedAllPreferences) {
      try {
        const allData = await userPreferencesService.getAllUserPreferences(userId);
        setAllPreferences(allData);
        setHasAnyPreferences(allData.length > 0);
        setHasLoadedAllPreferences(true);
      } catch (err) {
        console.log('Could not load all preferences, but current one loaded successfully');
        setHasAnyPreferences(true); // If we loaded current one, user has at least one
        setHasLoadedAllPreferences(true);
      }
    }
  } catch (err) {
    // Handle 404 by creating default preferences
    if (err.response?.status === 404) {
      console.log('No preferences found for this threat actor, using defaults');
      setCurrentPreferences({
        userId,
        threatActorId,
        sophisticationResourceWeights: { sophisticationWeight: 0.5, resourceWeight: 0.5 },
        motivationAnalysis: [],
        goalsAnalysis: [],
        vulnerabilities: [],
        commonVulnerabilitiesLevel: [],
        lossTypes: []
      });
      setCurrentThreatActorId(threatActorId);
      
      // Load all preferences to check if user is truly first time
      if (!hasLoadedAllPreferences) {
        try {
          const allData = await userPreferencesService.getAllUserPreferences(userId);
          setAllPreferences(allData);
          setHasAnyPreferences(allData.length > 0);
        } catch (allErr) {
          setHasAnyPreferences(false);
        }
        setHasLoadedAllPreferences(true);
      }
    } else {
      setError(err.message || 'Failed to load preferences');
      console.error('Error loading user preferences:', err);
    }
  } finally {
    setLoading(false);
  }
}, [hasLoadedAllPreferences]);

  // Load all preferences for user
  const loadAllUserPreferences = useCallback(async (userId) => {
    if (!userId) return;
    
    try {
      const data = await userPreferencesService.getAllUserPreferences(userId);
      setAllPreferences(data);
      setHasAnyPreferences(data.length > 0);
      setHasLoadedAllPreferences(true);
    } catch (err) {
      console.error('Error loading all user preferences:', err);
      setHasAnyPreferences(false);
      setHasLoadedAllPreferences(false);
    }
  }, []);

  const updatePreferences = useCallback(async (updates) => {
  if (!user?.id || !currentThreatActorId) return;
  
  try {
    // Optimistically update local state
    setCurrentPreferences(prev => ({ ...prev, ...updates }));
    
    // Update on server
    const updatedPreferences = await userPreferencesService.updatePreferences(
      user.id, 
      currentThreatActorId, 
      updates
    );
    setCurrentPreferences(updatedPreferences);
    setHasAnyPreferences(true); // User definitely has preferences now
    
    // Refresh all preferences
    await loadAllUserPreferences(user.id);
  } catch (err) {
    setError(err.message || 'Failed to update preferences');
    // Reload preferences on error to sync with server
    await loadPreferencesForThreatActor(user.id, currentThreatActorId);
  }
}, [user?.id, currentThreatActorId, loadAllUserPreferences, loadPreferencesForThreatActor]);

  // Update sophistication/resource weights
  const updateWeights = useCallback(async (sophisticationWeight, resourceWeight) => {
    if (!user?.id || !currentThreatActorId) return;
    
    try {
      // Optimistically update local state
      setCurrentPreferences(prev => ({
        ...prev,
        sophisticationResourceWeights: {
          sophisticationWeight,
          resourceWeight
        }
      }));
      
      const updatedPreferences = await userPreferencesService.updateSophisticationResourceWeights(
        user.id, 
        currentThreatActorId,
        sophisticationWeight, 
        resourceWeight
      );
      setCurrentPreferences(updatedPreferences);
    } catch (err) {
      setError(err.message || 'Failed to update weights');
      await loadPreferencesForThreatActor(user.id, currentThreatActorId);
    }
  }, [user?.id, currentThreatActorId, loadPreferencesForThreatActor]);

  // Update motivation analysis
  // const updateMotivationAnalysis = useCallback(async (motivationAnalysis) => {
  //   if (!user?.id || !currentThreatActorId) return;
    
  //   try {
  //     // Optimistically update local state
  //     setCurrentPreferences(prev => ({ ...prev, motivationAnalysis }));
      
  //     const updatedPreferences = await userPreferencesService.updateMotivationAnalysis(
  //       user.id, 
  //       currentThreatActorId,
  //       motivationAnalysis
  //     );
  //     setCurrentPreferences(updatedPreferences);
  //   } catch (err) {
  //     setError(err.message || 'Failed to update motivation analysis');
  //     await loadPreferencesForThreatActor(user.id, currentThreatActorId);
  //   }
  // }, [user?.id, currentThreatActorId, loadPreferencesForThreatActor]);

  // Update goals analysis
  // const updateGoalsAnalysis = useCallback(async (goalsAnalysis) => {
  //   if (!user?.id || !currentThreatActorId) return;
    
  //   try {
  //     // Optimistically update local state
  //     setCurrentPreferences(prev => ({ ...prev, goalsAnalysis }));
      
  //     const updatedPreferences = await userPreferencesService.updateGoalsAnalysis(
  //       user.id, 
  //       currentThreatActorId,
  //       goalsAnalysis
  //     );
  //     setCurrentPreferences(updatedPreferences);
  //   } catch (err) {
  //     setError(err.message || 'Failed to update goals analysis');
  //     await loadPreferencesForThreatActor(user.id, currentThreatActorId);
  //   }
  // }, [user?.id, currentThreatActorId, loadPreferencesForThreatActor]);

const getCommonVulnerabilityLevel = useCallback((vulnerabilityId) => {
  const commonVulns = currentPreferences?.commonVulnerabilitiesLevel;
  
  // Add debugging
  console.log('commonVulns:', commonVulns, 'type:', typeof commonVulns);
  
  // Ensure it's an array
  if (!Array.isArray(commonVulns)) {
    console.warn('commonVulnerabilitiesLevel is not an array:', commonVulns);
    return null;
  }
  
  const found = commonVulns.find(cv => cv.vulnerabilityId === vulnerabilityId);
  return found ? found.level : null;
}, [currentPreferences]);

  // Clear error
  const clearError = useCallback(() => setError(null), []);

  // Get specific preference values with defaults
  const getPreference = useCallback((key, defaultValue = null) => {
    return currentPreferences?.[key] ?? defaultValue;
  }, [currentPreferences]);

  // Check if this is first time for any threat actor
  // const isFirstTimeUser = useCallback(() => {
  //   return allPreferences.length === 0;
  // }, [allPreferences.length]);

  const isFirstTimeUser = useCallback(() => {
    // Only return true if we've checked and confirmed user has no preferences
    return hasLoadedAllPreferences && !hasAnyPreferences;
  }, [hasLoadedAllPreferences, hasAnyPreferences]);

  const value = {
    // State
    preferences: currentPreferences,
    allPreferences,
    currentThreatActorId,
    loading,
    error,
    hasLoadedAllPreferences,
    hasAnyPreferences,
    
    // Actions
    loadPreferencesForThreatActor,
    loadAllUserPreferences,
    updatePreferences,
    updateWeights,
    // updateMotivationAnalysis,
    // updateGoalsAnalysis,
    clearError,
    
    // Helpers
    getPreference,
    getCommonVulnerabilityLevel,
    isFirstTimeUser,
    
    // Computed values for easy access
    sophisticationWeight: currentPreferences?.sophisticationResourceWeights?.sophisticationWeight ?? 0.5,
    resourceWeight: currentPreferences?.sophisticationResourceWeights?.resourceWeight ?? 0.5,
    motivationAnalysis: currentPreferences?.motivationAnalysis ?? [],
    goalsAnalysis: currentPreferences?.goalsAnalysis ?? [],
    vulnerabilities: currentPreferences?.vulnerabilities ?? [],
    commonVulnerabilitiesLevel: currentPreferences?.commonVulnerabilitiesLevel ?? 'Moderate',
    lossTypes: currentPreferences?.lossTypes ?? []
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};