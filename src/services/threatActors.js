import axios from 'axios'

// const baseUrl = 'http://localhost:5000/api/threatActors'
const baseUrl = 'https://rocsi-production.up.railway.app/api/threatActors'

const getAll = async () => {
    const response = await axios.get(baseUrl)
    return response.data
}

const getById = async (id) => {
    const response = await axios.get(`${baseUrl}/${id}`)
    return response.data
}

const create = async (threatActorData) => {
    const response = await axios.post(baseUrl, threatActorData)
    return response.data
}

const update = async (id, threatActorData) => {
    const response = await axios.put(`${baseUrl}/${id}`, threatActorData)
    return response.data
}

const remove = async (id) => {
    const response = await axios.delete(`${baseUrl}/${id}`)
    return response.data
}

const addMotivations = async (id, motivations) => {
    const response = await axios.post(`${baseUrl}/${id}/motivations`, { motivations })
    return response.data
}

const addGoals = async (id, goals) => {
    const response = await axios.post(`${baseUrl}/${id}/goals`, { goals })
    return response.data
}

const addExploits = async (id, exploits) => {
    const response = await axios.post(`${baseUrl}/${id}/exploits`, { exploits })
    return response.data
}

const removeMotivation = async (id, motivationId) => {
    const response = await axios.delete(`${baseUrl}/${id}/motivations/${motivationId}`)
    return response.data
}

const removeGoal = async (id, goalId) => {
    const response = await axios.delete(`${baseUrl}/${id}/goals/${goalId}`)
    return response.data
}

const removeExploit = async (id, exploitId) => {
    const response = await axios.delete(`${baseUrl}/${id}/exploits/${exploitId}`)
    return response.data
}

export default {
    getAll,
    getById,
    create,
    update,
    remove,
    addMotivations,
    addGoals,
    addExploits,
    removeMotivation,
    removeGoal,
    removeExploit
}