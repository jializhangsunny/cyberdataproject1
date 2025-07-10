import axios from 'axios'

// const baseUrl = 'http://localhost:5000/api/organizations'
const baseUrl = 'https://rocsi-production.up.railway.app/api/organizations'

const getAll = async (organizationId) => {
    const response = await axios.get(`${baseUrl}/${organizationId}/controls`)
    return response.data
}

const create = async (organizationId, controlName) => {
    const response = await axios.post(`${baseUrl}/${organizationId}/controls`, {
        controlName
    })
    return response.data
}

const createBulk = async (organizationId, controls) => {
    const response = await axios.post(`${baseUrl}/${organizationId}/controls/bulk`, {
        controls
    })
    return response.data
}

const update = async (organizationId, controlName, newControlName) => {
    const encodedControlName = encodeURIComponent(controlName)
    const response = await axios.put(`${baseUrl}/${organizationId}/controls/${encodedControlName}`, {
        newControlName
    })
    return response.data
}

const remove = async (organizationId, controlName) => {
    const encodedControlName = encodeURIComponent(controlName)
    const response = await axios.delete(`${baseUrl}/${organizationId}/controls/${encodedControlName}`)
    return response.data
}

export default {
    getAll,
    create,
    createBulk,
    update,
    remove
}