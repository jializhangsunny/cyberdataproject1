import axios from 'axios';

// const baseUrl = 'http://localhost:5000/api/controlInteractionEffects'
const baseUrl = 'https://rocsi-production.up.railway.app/api/controlInteractionEffects';

const create = async (interactionData) => {
    const response = await axios.post(baseUrl, {
        organizationId: interactionData.organizationId,
        controlA: interactionData.controlA,
        controlB: interactionData.controlB,
        interactionEffect: interactionData.interactionEffect,
        description: interactionData.description,
        userId: interactionData.userId
    });
    return response.data;
};

const update = async (id, interactionData) => {
    const response = await axios.put(`${baseUrl}/${id}`, {
        interactionEffect: interactionData.interactionEffect,
        description: interactionData.description
    });
    return response.data;
};

const remove = async (id) => {
    const response = await axios.delete(`${baseUrl}/${id}`);
    return response.data;
};

const getInteractionMatrix = async (organizationId, controls) => {
    const controlsParam = Array.isArray(controls) ? controls.join(',') : controls;
    const response = await axios.get(`${baseUrl}/matrix/${organizationId}?controls=${encodeURIComponent(controlsParam)}`);
    return response.data;
};

const getControlInteractionSummary = async (organizationId, controlName) => {
    const encodedControlName = encodeURIComponent(controlName);
    const response = await axios.get(`${baseUrl}/summary/${organizationId}/${encodedControlName}`);
    return response.data;
};

// Helper method to create or update interaction effect
// const createOrUpdate = async (interactionData) => {
//     try {
//         // Try to create first
//         return await create(interactionData);
//     } catch (error) {
//         if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
//             // If it exists, we could try to find and update it, but for now just throw
//             throw new Error('Interaction effect already exists for this control pair');
//         }
//         throw error;
//     }
// };
// Help method to create or update interaction effect
const createOrUpdate = async (interactionData) => {
    try {
            // Try to create first
            return await create(interactionData);
        }
        catch (error) {
            if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
                // If it exists, find the existing one and update it
                try {
                    // First, get the existing interaction effect
                    const matrix = await getInteractionMatrix(interactionData.organizationId, [interactionData.controlA, interactionData.controlB]);
                    
                    // Find the existing interaction effect in the response
                    const existingInteraction = matrix.interactions.find(interaction => 
                        (interaction.controlA === interactionData.controlA && interaction.controlB === interactionData.controlB) ||
                        (interaction.controlA === interactionData.controlB && interaction.controlB === interactionData.controlA)
                    );
                    
                    if (existingInteraction) {
                        // Update the existing interaction effect
                        return await update(existingInteraction._id, {
                            interactionEffect: interactionData.interactionEffect,
                            description: interactionData.description
                        });
                    } else {
                        // Fallback: couldn't find existing interaction, throw original error
                        throw new Error('Interaction effect already exists for this control pair');
                    }
                } catch (updateError) {
                    console.error('Error updating interaction effect:', updateError);
                    throw new Error('Failed to update existing interaction effect');
            }
        }
        throw error;
    }
};

// Helper method to get interaction effect between two specific controls
const getInteractionBetweenControls = async (organizationId, controlA, controlB) => {
    try {
        const matrix = await getInteractionMatrix(organizationId, [controlA, controlB]);
        return matrix.interactionMatrix[controlA]?.[controlB] || 0;
    } catch (error) {
        console.error('Error getting interaction between controls:', error);
        return 0; // Default to no interaction if error
    }
};

// Helper method to get all interaction effects for multiple controls
const getMultipleControlSummaries = async (organizationId, controlNames) => {
    try {
        const summaries = await Promise.all(
            controlNames.map(controlName => 
                getControlInteractionSummary(organizationId, controlName)
                    .catch(error => {
                        console.warn(`Failed to get summary for ${controlName}:`, error.message);
                        return {
                            controlName,
                            totalInteractions: 0,
                            totalPositiveEffect: 0,
                            totalNegativeEffect: 0,
                            netInteractionEffect: 0,
                            interactions: []
                        };
                    })
            )
        );
        return summaries;
    } catch (error) {
        console.error('Error getting multiple control summaries:', error);
        return [];
    }
};

// Helper method to get total interaction effect for a single control
const getControlTotalInteractionEffect = async (organizationId, controlName, allControls) => {
    try {
        const matrix = await getInteractionMatrix(organizationId, allControls);
        
        if (!matrix.interactionMatrix[controlName]) {
            return 0;
        }
        
        // Sum all interaction effects for this control with other controls
        let totalEffect = 0;
        Object.entries(matrix.interactionMatrix[controlName]).forEach(([otherControl, effect]) => {
            if (effect !== null && otherControl !== controlName) {
                totalEffect += effect;
            }
        });
        
        return totalEffect;
    } catch (error) {
        console.error(`Error getting total interaction effect for ${controlName}:`, error);
        return 0;
    }
};

// Helper method to calculate synergy for a set of selected controls
const calculateSynergyEffect = async (organizationId, selectedControls) => {
    if (selectedControls.length < 2) return 0;
    
    try {
        const matrix = await getInteractionMatrix(organizationId, selectedControls);
        let synergyEffect = 0;
        
        // Calculate pairwise synergies
        for (let i = 0; i < selectedControls.length; i++) {
            for (let j = i + 1; j < selectedControls.length; j++) {
                const controlA = selectedControls[i];
                const controlB = selectedControls[j];
                const interaction = matrix.interactionMatrix[controlA]?.[controlB] || 0;
                synergyEffect += interaction;
            }
        }
        
        return synergyEffect;
    } catch (error) {
        console.error('Error calculating synergy effect:', error);
        return 0;
    }
};

export default {
    create,
    update,
    remove,
    getInteractionMatrix,
    getControlInteractionSummary,
    createOrUpdate,
    getInteractionBetweenControls,
    getMultipleControlSummaries,
    getControlTotalInteractionEffect,
    calculateSynergyEffect
};