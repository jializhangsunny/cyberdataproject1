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

// import axios from 'axios'

// // const baseUrl = 'http://localhost:5000/api/user-preferences'
// const baseUrl = 'https://rocsi-production.up.railway.app/api/user-preferences'

// // Add request interceptor for debugging
// axios.interceptors.request.use(request => {
//     console.log('Starting Request:', {
//         url: request.url,
//         method: request.method,
//         data: request.data,
//         headers: request.headers
//     });
//     return request;
// });

// // Add response interceptor for debugging
// axios.interceptors.response.use(
//     response => {
//         console.log('Response:', response.status, response.data);
//         return response;
//     },
//     error => {
//         console.error('Response Error:', {
//             status: error.response?.status,
//             statusText: error.response?.statusText,
//             data: error.response?.data,
//             url: error.config?.url,
//             method: error.config?.method
//         });
//         return Promise.reject(error);
//     }
// );

// // Get user preferences for specific threat actor
// const getUserPreferences = async (userId, threatActorId) => {
//     try {
//         const response = await axios.get(`${baseUrl}/${userId}/${threatActorId}`)
//         return response.data
//     } catch (error) {
//         console.error('getUserPreferences error:', error.response?.data || error.message);
//         throw error;
//     }
// }

// // Get all user preferences for all threat actors
// const getAllUserPreferences = async (userId) => {
//     try {
//         const response = await axios.get(`${baseUrl}/${userId}`)
//         return response.data
//     } catch (error) {
//         console.error('getAllUserPreferences error:', error.response?.data || error.message);
//         throw error;
//     }
// }

// // Update preferences for specific threat actor
// const updatePreferences = async (userId, threatActorId, preferences) => {
//     try {
//         const response = await axios.put(`${baseUrl}/${userId}/${threatActorId}`, preferences)
//         return response.data
//     } catch (error) {
//         console.error('updatePreferences error:', error.response?.data || error.message);
//         throw error;
//     }
// }

// // Add custom loss type (global, reusable)
// const addCustomLossType = async (userId, threatActorId, name, description) => {
//     try {
//         console.log('Adding custom loss type:', { userId, threatActorId, name, description });
        
//         // Make sure all parameters are valid
//         if (!userId || !threatActorId || !name) {
//             throw new Error('Missing required parameters: userId, threatActorId, or name');
//         }
        
//         const requestData = {
//             name: name.trim(),
//             description: description?.trim() || ''
//         };
        
//         const url = `${baseUrl}/${userId}/${threatActorId}/custom-loss-type`;
//         console.log('Request URL:', url);
//         console.log('Request Data:', requestData);
        
//         const response = await axios.post(url, requestData, {
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });
        
//         console.log('addCustomLossType success:', response.data);
//         return response.data;
        
//     } catch (error) {
//         console.error('addCustomLossType error details:', {
//             message: error.message,
//             status: error.response?.status,
//             statusText: error.response?.statusText,
//             data: error.response?.data,
//             url: error.config?.url
//         });
//         throw error;
//     }
// }

// // Update asset loss amount (for specific threat actor/asset combo)
// const updateAssetLossAmount = async (userId, threatActorId, assetId, lossTypeId, amount, isCustomType = false) => {
//     try {
//         console.log('Updating asset loss amount:', { userId, threatActorId, assetId, lossTypeId, amount, isCustomType });
        
//         if (!userId || !threatActorId || !assetId || !lossTypeId) {
//             throw new Error('Missing required parameters');
//         }
        
//         const requestData = {
//             assetId,
//             lossTypeId,
//             amount: parseFloat(amount) || 0,
//             isCustomType: Boolean(isCustomType)
//         };
        
//         const response = await axios.put(`${baseUrl}/${userId}/${threatActorId}/asset-loss-amount`, requestData, {
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });
        
//         return response.data;
        
//     } catch (error) {
//         console.error('updateAssetLossAmount error:', error.response?.data || error.message);
//         throw error;
//     }
// }

// // Remove custom loss type
// const removeCustomLossType = async (userId, threatActorId, customLossTypeId) => {
//     try {
//         const response = await axios.delete(`${baseUrl}/${userId}/${threatActorId}/custom-loss-type/${customLossTypeId}`)
//         return response.data
//     } catch (error) {
//         console.error('removeCustomLossType error:', error.response?.data || error.message);
//         throw error;
//     }
// }

// // Remove asset loss amount
// const removeAssetLossAmount = async (userId, threatActorId, assetId, lossTypeId) => {
//     try {
//         const response = await axios.delete(`${baseUrl}/${userId}/${threatActorId}/asset-loss-amount`, {
//             data: { assetId, lossTypeId },
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         })
//         return response.data
//     } catch (error) {
//         console.error('removeAssetLossAmount error:', error.response?.data || error.message);
//         throw error;
//     }
// }

// // Get all custom loss types for user (across all threat actors)
// const getAllCustomLossTypes = async (userId) => {
//     try {
//         const response = await axios.get(`${baseUrl}/${userId}/custom-loss-types`)
//         return response.data
//     } catch (error) {
//         console.error('getAllCustomLossTypes error:', error.response?.data || error.message);
//         throw error;
//     }
// }

// // Delete user preferences for specific threat actor
// const deleteUserPreferences = async (userId, threatActorId) => {
//     try {
//         const response = await axios.delete(`${baseUrl}/${userId}/${threatActorId}`)
//         return response.data
//     } catch (error) {
//         console.error('deleteUserPreferences error:', error.response?.data || error.message);
//         throw error;
//     }
// }

// export default {
//     getUserPreferences,
//     getAllUserPreferences,
//     updatePreferences,
//     addCustomLossType,
//     updateAssetLossAmount,
//     removeCustomLossType,
//     removeAssetLossAmount,
//     getAllCustomLossTypes,
//     deleteUserPreferences
// }