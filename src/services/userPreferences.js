import axios from 'axios'

// const baseUrl = 'http://localhost:5000/api/user-preferences'
const baseUrl = 'https://rocsi-production.up.railway.app/api/user-preferences'

// Get user preferences for specific threat actor
const getUserPreferences = async (userId, threatActorId) => {
    try {
        const response = await axios.get(`${baseUrl}/${userId}/${threatActorId}`)
        return response.data
    } catch (error) {
        // Handle 404 case where no preferences exist - return null instead of throwing
        if (error.response?.status === 404) {
            return null
        }
        throw error
    }
}

// Get all user preferences for all threat actors
const getAllUserPreferences = async (userId) => {
    const response = await axios.get(`${baseUrl}/${userId}`)
    return response.data
}

// Main bulk update preferences for specific threat actor
const updatePreferences = async (userId, threatActorId, preferences) => {
    const response = await axios.put(`${baseUrl}/${userId}/${threatActorId}`, preferences)
    return response.data
}

// Individual update methods (using the new granular endpoints)
const updateSophisticationWeight = async (userId, threatActorId, sophisticationWeight) => {
    const response = await axios.put(`${baseUrl}/${userId}/${threatActorId}/sophistication-weight`, {
        sophisticationWeight
    })
    return response.data
}

const updateMotivationAnalysis = async (userId, threatActorId, motivationAnalysis) => {
    const response = await axios.put(`${baseUrl}/${userId}/${threatActorId}/motivation-analysis`, { 
        motivationAnalysis 
    })
    return response.data
}

const updateGoalsAnalysis = async (userId, threatActorId, goalsAnalysis) => {
    const response = await axios.put(`${baseUrl}/${userId}/${threatActorId}/goals-analysis`, { 
        goalsAnalysis 
    })
    return response.data
}

// Delete user preferences for specific threat actor
const deleteUserPreferences = async (userId, threatActorId) => {
    const response = await axios.delete(`${baseUrl}/${userId}/${threatActorId}`)
    return response.data
}

// Common vulnerabilities level methods
const updateCommonVulnerabilityLevel = async (userId, threatActorId, vulnerabilityId, level) => {
    const response = await axios.put(`${baseUrl}/${userId}/${threatActorId}/common-vulnerability-level`, {
        vulnerabilityId,
        level
    })
    return response.data
}

const updateCommonVulnerabilitiesLevelBulk = async (userId, threatActorId, commonVulnerabilitiesLevel) => {
    const response = await axios.put(`${baseUrl}/${userId}/${threatActorId}/common-vulnerabilities-level-bulk`, {
        commonVulnerabilitiesLevel
    })
    return response.data
}

export default {
    // Core methods
    getUserPreferences,
    getAllUserPreferences,
    updatePreferences,
    deleteUserPreferences,
    
    // Granular update methods
    updateSophisticationWeight,
    updateMotivationAnalysis,
    updateGoalsAnalysis,
    
    // Common vulnerabilities methods
    updateCommonVulnerabilityLevel,
    updateCommonVulnerabilitiesLevelBulk,
}