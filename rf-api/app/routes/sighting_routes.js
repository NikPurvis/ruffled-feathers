// routes/sighting_routes.js

// Import dependencies
const express = require("express")
const passport = require("passport")

// Import middleware
// Customizes certain errors
const customErrors = require("../../lib/custom_errors")
// Sends a 404 when a non-existent document is requested
const handle404 = customErrors.handle404
// Sends 401 error when user tries to access something they don't own
const requireOwnership = customErrors.requireOwnership
// Sets req.user and passes token when necessary for certain route access
const requireToken = passport.authenticate("bearer", { sesson: false })
// Removes blank fields from req.body
const removeBlanks = require("../../lib/remove_blank_fields")

// Import models
const Sighting = require("../models/sighting")

// Instantiate router
const router = express.Router()


// INDEX
// GET - all sightings
router.get("/sightings", (req, res, next) => {
	Sighting.find()
		.populate("owner")
		.then(sightings => {
			// sightings will be an array of Mongoose documents
			// Map will return a new array so we want to turn them into POJO
			// (Plain Old JavaScript Objects)
			return sightings.map(sighting => sighting.toObject())
		})
		.then(sightings => res.status(200).json({ sightings }))
		.catch(next)
})

// SHOW
// GET - individual sighting
router.get("/sightings/:id", (req, res, next) => {
	// :id acquired from URL via req.params.id
	Sighting.findById(req.params.id)
		.populate("owner")
		.then(handle404)
		// If successful, response with the object as JSON
		.then(sighting => res.status(200).json({ sighting: sighting.toObject() }))
		// Otherwise, pass to error handler
		.catch(next)
})

// CREATE
// POST - create new sighting
router.post("/sightings", requireToken, (req, res, next) => {
	// By bringing in requireToken, we have access to req.user
	req.body.sighting.owner = req.user.id

	Sighting.create(req.body.sighting)
		.then(sighting => {
			// Send a successful response on creation
			res.status(201).json({ sighting: sighting.toObject() })
		})
		.catch(next)
})

// UPDATE
// PATCH - edit sighting
router.patch("/sightings/:id", requireToken, removeBlanks, (req, res, next) => {
	// Prevent the client from changing the sighting owner
	delete req.body.owner
	Sighting.findById(req.params.id)
		.then(handle404)
		.then(sighting => {
			requireOwnership(req, sighting)
			return sighting.updateOne(req.body.sighting)
		})
		.then(() => res.sendStatus(204))
		.catch(next)
})

// REMOVE
// DELETE - delete specific sighting
router.delete("/sightings/:id", requireToken, (req, res, next) => {
	Sighting.findById(req.params.id)
		.then(handle404)
		.then(sighting => {
			requireOwnership(req, sighting)
			sighting.deleteOne()
		})
		.then(() => res.sendStatus(204))
		.catch(next)
})

module.exports = router
