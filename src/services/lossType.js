import axios from 'axios'

// const baseUrl = 'http://localhost:5000/api/loss-types'
const baseUrl = 'https://rocsi-production.up.railway.app/api/loss-types'

const initializeDefaults = async (userId) => {
    const response = await axios.post(`${baseUrl}/initialize-defaults`, { userId })
    return response.data
}

const getForUser = async (userId) => {
    const response = await axios.get(`${baseUrl}/user/${userId}`)
    return response.data
}

const create = async (lossTypeData) => {
    const response = await axios.post(baseUrl, lossTypeData)
    return response.data
}

const update = async (id, updates) => {
    const response = await axios.put(`${baseUrl}/${id}`, updates)
    return response.data
}

const updateMultiple = async (updates) => {
    const response = await axios.put(`${baseUrl}/bulk/update`, { updates })
    return response.data
}

const remove = async (id) => {
    const response = await axios.delete(`${baseUrl}/${id}`)
    return response.data
}

const resetToDefaults = async (userId) => {
    const response = await axios.post(`${baseUrl}/reset-to-defaults`, { userId })
    return response.data
}

export default {
    initializeDefaults,
    getForUser,
    create,
    update,
    updateMultiple,
    remove,
    resetToDefaults
}
