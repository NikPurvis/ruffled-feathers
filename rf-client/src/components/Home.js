// components/Home.js

import IndexSightings from "./sightings/IndexSightings"

const Home = (props) => {
	// const { msgAlert, user } = props
	console.log("Props in Home:", props)

	return (
		<>
			<h2>Home Page</h2>
			<IndexSightings />
		</>
	)
}

export default Home
