import axios from 'axios'

// const baseUrl = 'http://localhost:5000/api/netRiskReductions'
const baseUrl = 'https://rocsi-production.up.railway.app/api/netRiskReductions'

const getAll = async () => {
    const response = await axios.get(baseUrl)
    return response.data
}

const getById = async (id) => {
    const response = await axios.get(`${baseUrl}/${id}`)
    return response.data
}

const create = async (riskAssessmentData) => {
    const response = await axios.post(baseUrl, {
        userId: riskAssessmentData.userId,
        organizationId: riskAssessmentData.organizationId,
        vulnerabilityId: riskAssessmentData.vulnerabilityId,
        control: riskAssessmentData.control,
        riskReductionDegree: riskAssessmentData.riskReductionDegree,
        newVulnerabilityPossibility: riskAssessmentData.newVulnerabilityPossibility,
        potentialNewRisks: riskAssessmentData.potentialNewRisks
    })
    return response.data
}

const update = async (id, riskAssessmentData) => {
    const response = await axios.put(`${baseUrl}/${id}`, riskAssessmentData)
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

const getByVulnerability = async (vulnerabilityId) => {
    const response = await axios.get(`${baseUrl}/vulnerability/${vulnerabilityId}`)
    return response.data
}

const getRiskAssessment = async (userId, organizationId, vulnerabilityId, control) => {
    const response = await axios.get(`${baseUrl}/assessment`, {
        params: {
            userId,
            organizationId,
            vulnerabilityId,
            control
        }
    })
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
    getByVulnerability,
    getRiskAssessment
}