import axios from 'axios'

// const baseUrl = 'http://localhost:5000/api/controlSelectionMatrix'
const baseUrl = 'https://rocsi-production.up.railway.app/api/controlSelectionMatrix'

const getAll = async () => {
    const response = await axios.get(baseUrl)
    return response.data
}

const getById = async (id) => {
    const response = await axios.get(`${baseUrl}/${id}`)
    return response.data
}

const create = async (selectionData) => {
    const response = await axios.post(baseUrl, {
        userId: selectionData.userId,
        organizationId: selectionData.organizationId,
        controlName: selectionData.controlName,
        includeInSet: selectionData.includeInSet || false
    })
    return response.data
}

const update = async (id, selectionData) => {
    const response = await axios.put(`${baseUrl}/${id}`, selectionData)
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

const getControlSelection = async (userId, organizationId, controlName) => {
    const response = await axios.get(`${baseUrl}/selection`, {
        params: {
            userId,
            organizationId,
            controlName
        }
    })
    return response.data
}

const getSelectedControls = async (organizationId) => {
    const response = await axios.get(`${baseUrl}/organization/${organizationId}/selected`)
    return response.data
}

const getRejectedControls = async (organizationId) => {
    const response = await axios.get(`${baseUrl}/organization/${organizationId}/rejected`)
    return response.data
}

const toggleSelection = async (id) => {
    const response = await axios.patch(`${baseUrl}/${id}/toggle`)
    return response.data
}

const getSelectionSummary = async (organizationId) => {
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
    getControlSelection,
    getSelectedControls,
    getRejectedControls,
    toggleSelection,
    getSelectionSummary
}