import axios from 'axios'

// const baseUrl = 'http://localhost:5000/api/organizations'
const baseUrl = 'https://rocsi-production.up.railway.app/api/organizations'

const getAll = async () => {
    const response = await axios.get(baseUrl)
    return response.data
}

const getById = async (id) => {
    const response = await axios.get(`${baseUrl}/${id}`)
    return response.data
}

const create = async (organizationData) => {
    const response = await axios.post(baseUrl, organizationData)
    return response.data
}

const update = async (id, organizationData) => {
    const response = await axios.put(`${baseUrl}/${id}`, organizationData)
    return response.data
}

const remove = async (id) => {
    const response = await axios.delete(`${baseUrl}/${id}`)
    return response.data
}

const addVulnerability = async (id, vulnerabilityData) => {
    const response = await axios.post(`${baseUrl}/${id}/vulnerabilities`, vulnerabilityData)
    return response.data
}

const updateVulnerability = async (id, vulnerabilityId, vulnerabilityData) => {
    const response = await axios.put(`${baseUrl}/${id}/vulnerabilities/${vulnerabilityId}`, vulnerabilityData)
    return response.data
}

const removeVulnerability = async (id, vulnerabilityId) => {
    const response = await axios.delete(`${baseUrl}/${id}/vulnerabilities/${vulnerabilityId}`)
    return response.data
}

const getOverlappingVulnerabilities = async (organizationId, threatActorId) => {
    const url = threatActorId 
        ? `${baseUrl}/${organizationId}/overlapping-vulnerabilities?threatActorId=${threatActorId}`
        : `${baseUrl}/${organizationId}/overlapping-vulnerabilities`
    const response = await axios.get(url)
    return response.data
}

export default {
    getAll,
    getById,
    create,
    update,
    remove,
    addVulnerability,
    updateVulnerability,
    removeVulnerability,
    getOverlappingVulnerabilities
}