import axios from 'axios'

const baseUrl = 'https://rocsi-production.up.railway.app/api/assets'

const getAllByOrgId = async (orgId) => {
    const response = await axios.get(`${baseUrl}/organization/${orgId}`)
    return response.data
} 

export default {
    getAllByOrgId
}