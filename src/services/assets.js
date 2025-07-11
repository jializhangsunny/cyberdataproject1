import axios from 'axios'

const baseUrl = 'https://rocsi-production.up.railway.app/api/assets'

// Get all assets (both org-wide and user-specific)
const getAll = async () => {
    const response = await axios.get(baseUrl)
    return response.data
}

// Get organization-wide default assets only
const getAllByOrgId = async (orgId) => {
    const response = await axios.get(`${baseUrl}/organization/${orgId}`)
    return response.data
}

// Get assets for organization with user assets included
const getForUser = async (orgId, userId) => {
    const response = await axios.get(`${baseUrl}/organization/${orgId}/for-user`, {
        params: { userId }
    })
    return response.data
}

// Create new asset (org-wide or user-specific)
const create = async (assetData) => {
    const response = await axios.post(baseUrl, assetData)
    return response.data
}

// Get single asset by ID
const getById = async (assetId) => {
    const response = await axios.get(`${baseUrl}/${assetId}`)
    return response.data
}

// Update asset (simple update - no copying)
const update = async (assetId, updateData) => {
    const response = await axios.put(`${baseUrl}/${assetId}`, updateData)
    return response.data
}

// Delete asset
const remove = async (assetId) => {
    const response = await axios.delete(`${baseUrl}/${assetId}`)
    return response.data
}

// Add vulnerability to asset
const addVulnerability = async (assetId, vulnerability) => {
    const response = await axios.post(`${baseUrl}/${assetId}/vulnerabilities`, { vulnerability })
    return response.data
}

// Remove vulnerability from asset
const removeVulnerability = async (assetId, vulnerabilityId) => {
    const response = await axios.delete(`${baseUrl}/${assetId}/vulnerabilities/${vulnerabilityId}`)
    return response.data
}

// Get asset statistics by organization
const getStatsByOrganization = async (orgId, userId = null) => {
    const response = await axios.get(`${baseUrl}/organization/${orgId}/stats`, {
        params: userId ? { userId } : {}
    })
    return response.data
}

// Get assets with specific vulnerability
const getByVulnerability = async (vulnerabilityName, userId = null) => {
    const response = await axios.get(`${baseUrl}/vulnerability/${vulnerabilityName}`, {
        params: userId ? { userId } : {}
    })
    return response.data
}

// Get overlapping vulnerabilities between asset and threat actors
const getOverlappingVulnerabilities = async (assetId, options = {}) => {
    const { threatActorId } = options
    const response = await axios.get(`${baseUrl}/${assetId}/overlapping-vulnerabilities`, {
        params: {
            ...(threatActorId && { threatActorId })
        }
    })
    return response.data
}

export default {
    getAll,
    getAllByOrgId,
    getForUser,
    create,
    getById,
    update,
    remove,
    addVulnerability,
    removeVulnerability,
    getStatsByOrganization,
    getByVulnerability,
    getOverlappingVulnerabilities
}