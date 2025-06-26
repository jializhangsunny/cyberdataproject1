import axios from 'axios'

// const baseUrl = 'http://localhost:5000/api/user-preferences'
const baseUrl = 'https://rocsi-production.up.railway.app/api/user-preferences'

// Get user preferences for specific threat actor
const getUserPreferences = async (userId, threatActorId) => {
    const response = await axios.get(`${baseUrl}/${userId}/${threatActorId}`)
    return response.data
}

// Get all user preferences for all threat actors
const getAllUserPreferences = async (userId) => {
    const response = await axios.get(`${baseUrl}/${userId}`)
    return response.data
}

// Update preferences for specific threat actor
const updatePreferences = async (userId, threatActorId, preferences) => {
    const response = await axios.put(`${baseUrl}/${userId}/${threatActorId}`, preferences)
    return response.data
}


// THE SERVICES BELOW ARE NOT IMPLMENETED IN THE BACKEND - use bulk updates
// Update sophistication/resource weights for specific threat actor
// const updateSophisticationResourceWeights = async (userId, threatActorId, sophisticationWeight, resourceWeight) => {
//     const response = await axios.put(`${baseUrl}/${userId}/${threatActorId}/weights`, {
//         sophisticationWeight,
//         resourceWeight
//     })
//     return response.data
// }

// // Update motivation analysis for specific threat actor
// const updateMotivationAnalysis = async (userId, threatActorId, motivationAnalysis) => {
//     const response = await axios.put(`${baseUrl}/${userId}/${threatActorId}/motivations`, { motivationAnalysis })
//     return response.data
// }

// // Update goals analysis for specific threat actor
// const updateGoalsAnalysis = async (userId, threatActorId, goalsAnalysis) => {
//     const response = await axios.put(`${baseUrl}/${userId}/${threatActorId}/goals`, { goalsAnalysis })
//     return response.data
// }

// // Update vulnerability status for specific threat actor
// const updateVulnerabilityStatus = async (userId, threatActorId, vulnerabilityId, status, affectedSystem) => {
//     const response = await axios.put(`${baseUrl}/${userId}/${threatActorId}/vulnerability`, {
//         vulnerabilityId,
//         status,
//         affectedSystem
//     })
//     return response.data
// }

// // Update common vulnerabilities level for specific threat actor
// const updateCommonVulnerabilitiesLevel = async (userId, threatActorId, level) => {
//     const response = await axios.put(`${baseUrl}/${userId}/${threatActorId}/common-vulnerabilities`, { level })
//     return response.data
// }

// // Update loss type for specific threat actor
// const updateLossType = async (userId, threatActorId, name, amount, description, isCustom = false) => {
//     const response = await axios.put(`${baseUrl}/${userId}/${threatActorId}/loss-type`, {
//         name,
//         amount,
//         description,
//         isCustom
//     })
//     return response.data
// }

// // Remove loss type for specific threat actor
// const removeLossType = async (userId, threatActorId, lossTypeName) => {
//     const response = await axios.delete(`${baseUrl}/${userId}/${threatActorId}/loss-type/${lossTypeName}`)
//     return response.data
// }

// Add custom loss type (global, reusable)
const addCustomLossType = async (userId, threatActorId, name, description) => {
    const response = await axios.post(`${baseUrl}/${userId}/${threatActorId}/custom-loss-type`, {
        name,
        description
    })
    return response.data
}

// Update asset loss amount (for specific threat actor/asset combo)
const updateAssetLossAmount = async (userId, threatActorId, assetId, lossTypeId, amount, isCustomType = false) => {
    const response = await axios.put(`${baseUrl}/${userId}/${threatActorId}/asset-loss-amount`, {
        assetId,
        lossTypeId,
        amount,
        isCustomType
    })
    return response.data
}

// Remove custom loss type
const removeCustomLossType = async (userId, threatActorId, customLossTypeId) => {
    const response = await axios.delete(`${baseUrl}/${userId}/${threatActorId}/custom-loss-type/${customLossTypeId}`)
    return response.data
}

// Remove asset loss amount
const removeAssetLossAmount = async (userId, threatActorId, assetId, lossTypeId) => {
    const response = await axios.delete(`${baseUrl}/${userId}/${threatActorId}/asset-loss-amount`, {
        data: { assetId, lossTypeId }
    })
    return response.data
}

// Get all custom loss types for user (across all threat actors)
const getAllCustomLossTypes = async (userId) => {
    const response = await axios.get(`${baseUrl}/${userId}/custom-loss-types`)
    return response.data
}

// Delete user preferences for specific threat actor
const deleteUserPreferences = async (userId, threatActorId) => {
    const response = await axios.delete(`${baseUrl}/${userId}/${threatActorId}`)
    return response.data
}

export default {
    getUserPreferences,
    getAllUserPreferences,
    updatePreferences,
    addCustomLossType,
    updateAssetLossAmount,
    removeCustomLossType,
    removeAssetLossAmount,
    getAllCustomLossTypes,
    // updateSophisticationResourceWeights,
    // updateMotivationAnalysis,
    // updateGoalsAnalysis,
    // updateVulnerabilityStatus,
    // updateCommonVulnerabilitiesLevel,
    // updateLossType,
    // removeLossType,
    deleteUserPreferences
}