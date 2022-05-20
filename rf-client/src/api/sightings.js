// api/sightings.js

import apiUrl from "../apiConfig"
import axios from "axios"

// index function
export const getAllSightings = () => {
    return axios(`${apiUrl}/sightings`)
}
