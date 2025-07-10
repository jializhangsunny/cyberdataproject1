import axios from 'axios'

// const baseUrl = 'http://localhost:5000/api/controlCostAnalyses'
const baseUrl = 'https://rocsi-production.up.railway.app/api/controlCostAnalyses'

const getAll = async () => {
    const response = await axios.get(baseUrl)
    return response.data
}

const getById = async (id) => {
    const response = await axios.get(`${baseUrl}/${id}`)
    return response.data
}

const create = async (costAnalysisData) => {
    const response = await axios.post(baseUrl, {
        userId: costAnalysisData.userId,
        organizationId: costAnalysisData.organizationId,
        controlName: costAnalysisData.controlName,
        purchaseCost: costAnalysisData.purchaseCost || 0,
        operationalCost: costAnalysisData.operationalCost || 0,
        trainingCost: costAnalysisData.trainingCost || 0,
        manpowerCost: costAnalysisData.manpowerCost || 0
    })
    return response.data
}

const update = async (id, costAnalysisData) => {
    const response = await axios.put(`${baseUrl}/${id}`, costAnalysisData)
    return response.data
}

const remove = async (id) => {
    const response = await axios.delete(`${baseUrl}/${id}`)
    return response.data
}

const getByUser = async (userId) => {
    const response = await axios.get(`${baseUrl}/user/${userId}`)
    return response.data
}

const getByOrganization = async (organizationId) => {
    const response = await axios.get(`${baseUrl}/organization/${organizationId}`)
    return response.data
}

const getByControl = async (controlName) => {
    const encodedControlName = encodeURIComponent(controlName)
    const response = await axios.get(`${baseUrl}/control/${encodedControlName}`)
    return response.data
}

const getCostAnalysis = async (userId, organizationId, controlName) => {
    const response = await axios.get(`${baseUrl}/analysis`, {
        params: {
            userId,
            organizationId,
            controlName
        }
    })
    return response.data
}

const getCostSummary = async (organizationId) => {
    const response = await axios.get(`${baseUrl}/organization/${organizationId}/summary`)
    return response.data
}

export default {
    getAll,
    getById,
    create,
    update,
    remove,
    getByUser,
    getByOrganization,
    getByControl,
    getCostAnalysis,
    getCostSummary
}