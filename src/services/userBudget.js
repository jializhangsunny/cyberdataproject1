import axios from 'axios'

// const baseUrl = 'http://localhost:5000/api/budgets'
const baseUrl = 'https://rocsi-production.up.railway.app/api/budgets'

const setBudget = async (userId, organizationId, totalBudget) => {
    const response = await axios.post(baseUrl, {
        userId,
        organizationId,
        totalBudget
    })
    return response.data
}

const getUserBudget = async (userId, organizationId) => {
    const response = await axios.get(`${baseUrl}/${userId}/${organizationId}`)
    return response.data
}

const getBudgetAnalysis = async (userId, organizationId) => {
    const response = await axios.get(`${baseUrl}/${userId}/${organizationId}/analysis`)
    return response.data
}

export default {
    setBudget,
    getUserBudget,
    getBudgetAnalysis
}