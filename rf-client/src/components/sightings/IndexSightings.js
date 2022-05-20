// components/sightings/IndexSightings.js

import React, { useState, useEffect } from "react"
import { getAllSightings } from "../../api/sightings"

const IndexSightings = (props) => {
    const [sightings, setSightings] = useState(null)

    useEffect(() => {
        getAllSightings()
            .then(res => {
                setSightings(res.data.sightings)
            })
            .catch(console.error)
    }, [])

    if (!sightings) {
        return <p>Loading...</p>
    } else if (sightings.length === 0) {
        return <p>No sightings, go add some!</p>
    }

    let sightingsJsx

    if (sightings.length > 0) {
        sightingsJsx = sightings.map(sighting => (
            <li key={sighting.id}>
                {sighting.where_seen}
            </li>
        ))
    }

    return (
        <>
            <h3>All Sightings</h3>
            <ul>
                {sightingsJsx}
            </ul>
        </>
    )
}

export default IndexSightings
