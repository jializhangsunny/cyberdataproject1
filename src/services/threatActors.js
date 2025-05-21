import axios from 'axios'
const baseUrl = 'localhost:5000/api/threatActors/'

const getAll = () => {
    const request = axios.get(baseUrl)
    return response.data
}

export default {
    getAll
}
