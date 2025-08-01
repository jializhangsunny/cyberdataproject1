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
      
      if (data) {
        setCurrentPreferences(data);
      } else {
        // No preferences found, use defaults
        setCurrentPreferences({
          userId,
          threatActorId,
          sophisticationResourceWeights: { sophisticationWeight: 0.5, resourceWeight: 0.5 },
          motivationAnalysis: [],
          goalsAnalysis: [],
          commonVulnerabilitiesLevel: []
        });
      }
      setCurrentThreatActorId(threatActorId);
      
      // Load all preferences if not already loaded
      if (!hasLoadedAllPreferences) {
        try {
          const allData = await userPreferencesService.getAllUserPreferences(userId);
          setAllPreferences(allData);
          setHasAnyPreferences(allData.length > 0);
          setHasLoadedAllPreferences(true);
        } catch (err) {
          setHasAnyPreferences(!!data);
          setHasLoadedAllPreferences(true);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load preferences');
      console.error('Error loading user preferences:', err);
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
      setHasAnyPreferences(true);
      
      // Refresh all preferences
      await loadAllUserPreferences(user.id);
    } catch (err) {
      setError(err.message || 'Failed to update preferences');
      // Reload preferences on error to sync with server
      await loadPreferencesForThreatActor(user.id, currentThreatActorId);
    }
  }, [user?.id, currentThreatActorId, loadAllUserPreferences, loadPreferencesForThreatActor]);

  // Update sophistication weight only
  const updateSophisticationWeight = useCallback(async (sophisticationWeight) => {
    if (!user?.id || !currentThreatActorId) return;
    
    try {
      setCurrentPreferences(prev => ({
        ...prev,
        sophisticationResourceWeights: {
          sophisticationWeight,
          resourceWeight: 1 - sophisticationWeight
        }
      }));
      
      const updatedPreferences = await userPreferencesService.updateSophisticationWeight(
        user.id, 
        currentThreatActorId,
        sophisticationWeight
      );
      setCurrentPreferences(updatedPreferences);
    } catch (err) {
      setError(err.message || 'Failed to update sophistication weight');
      await loadPreferencesForThreatActor(user.id, currentThreatActorId);
    }
  }, [user?.id, currentThreatActorId, loadPreferencesForThreatActor]);

  // Update motivation analysis only
  const updateMotivationAnalysis = useCallback(async (motivationAnalysis) => {
    if (!user?.id || !currentThreatActorId) return;
    
    try {
      setCurrentPreferences(prev => ({ ...prev, motivationAnalysis }));
      
      const updatedPreferences = await userPreferencesService.updateMotivationAnalysis(
        user.id, 
        currentThreatActorId,
        motivationAnalysis
      );
      setCurrentPreferences(updatedPreferences);
    } catch (err) {
      setError(err.message || 'Failed to update motivation analysis');
      await loadPreferencesForThreatActor(user.id, currentThreatActorId);
    }
  }, [user?.id, currentThreatActorId, loadPreferencesForThreatActor]);

  // Update goals analysis only
  const updateGoalsAnalysis = useCallback(async (goalsAnalysis) => {
    if (!user?.id || !currentThreatActorId) return;
    
    try {
      setCurrentPreferences(prev => ({ ...prev, goalsAnalysis }));
      
      const updatedPreferences = await userPreferencesService.updateGoalsAnalysis(
        user.id, 
        currentThreatActorId,
        goalsAnalysis
      );
      setCurrentPreferences(updatedPreferences);
    } catch (err) {
      setError(err.message || 'Failed to update goals analysis');
      await loadPreferencesForThreatActor(user.id, currentThreatActorId);
    }
  }, [user?.id, currentThreatActorId, loadPreferencesForThreatActor]);

  // REINTRODUCED: Common vulnerability level methods
  const updateCommonVulnerabilityLevel = useCallback(async (vulnerabilityId, level) => {
    if (!user?.id || !currentThreatActorId) return;
    
    try {
      // Optimistically update local state
      setCurrentPreferences(prev => {
        const updatedCommonVulns = [...(prev?.commonVulnerabilitiesLevel || [])];
        const existingIndex = updatedCommonVulns.findIndex(cv => cv.vulnerabilityId === vulnerabilityId);
        
        if (existingIndex !== -1) {
          updatedCommonVulns[existingIndex].level = level;
        } else {
          updatedCommonVulns.push({ vulnerabilityId, level });
        }
        
        return { ...prev, commonVulnerabilitiesLevel: updatedCommonVulns };
      });
      
      const updatedPreferences = await userPreferencesService.updateCommonVulnerabilityLevel(
        user.id, 
        currentThreatActorId,
        vulnerabilityId,
        level
      );
      setCurrentPreferences(updatedPreferences);
    } catch (err) {
      setError(err.message || 'Failed to update vulnerability level');
      await loadPreferencesForThreatActor(user.id, currentThreatActorId);
    }
  }, [user?.id, currentThreatActorId, loadPreferencesForThreatActor]);

  const updateCommonVulnerabilitiesLevelBulk = useCallback(async (commonVulnerabilitiesLevel) => {
    if (!user?.id || !currentThreatActorId) return;
    
    try {
      setCurrentPreferences(prev => ({ ...prev, commonVulnerabilitiesLevel }));
      
      const updatedPreferences = await userPreferencesService.updateCommonVulnerabilitiesLevelBulk(
        user.id, 
        currentThreatActorId,
        commonVulnerabilitiesLevel
      );
      setCurrentPreferences(updatedPreferences);
    } catch (err) {
      setError(err.message || 'Failed to update vulnerability levels');
      await loadPreferencesForThreatActor(user.id, currentThreatActorId);
    }
  }, [user?.id, currentThreatActorId, loadPreferencesForThreatActor]);

  // REINTRODUCED: Get common vulnerability level helper function
  const getCommonVulnerabilityLevel = useCallback((vulnerabilityId) => {
    const commonVulns = currentPreferences?.commonVulnerabilitiesLevel;
    
    // Ensure it's an array
    if (!Array.isArray(commonVulns)) {
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
    updateSophisticationWeight,
    updateMotivationAnalysis,
    updateGoalsAnalysis,
    updateCommonVulnerabilityLevel,
    updateCommonVulnerabilitiesLevelBulk,
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
    commonVulnerabilitiesLevel: currentPreferences?.commonVulnerabilitiesLevel ?? []
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};