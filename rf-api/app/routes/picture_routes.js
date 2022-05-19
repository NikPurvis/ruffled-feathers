// routes/picture_routes.js

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
const Picture = require("../models/picture")

// Instantiate router
const router = express.Router()


// INDEX
// GET - all pictures
router.get("/pictures", (req, res, next) => {
	Picture.find()
		.populate("owner")
		.then(pictures => {
			// pictures will be an array of Mongoose documents
			// Map will return a new array so we want to turn them into POJO
			// (Plain Old JavaScript Objects)
			return pictures.map(picture => picture.toObject())
		})
		.then(pictures => res.status(200).json({ pictures }))
		.catch(next)
})

// SHOW
// GET - individual picture
router.get("/pictures/:id", (req, res, next) => {
	// :id acquired from URL via req.params.id
	Picture.findById(req.params.id)
		.populate("owner")
		.then(handle404)
		// If successful, response with the object as JSON
		.then(picture => res.status(200).json({ picture: picture.toObject() }))
		// Otherwise, pass to error handler
		.catch(next)
})

// CREATE
// POST - create new picture
router.post("/pictures", requireToken, (req, res, next) => {
	// By bringing in requireToken, we have access to req.user
	req.body.picture.owner = req.user.id

	Picture.create(req.body.picture)
		.then(picture => {
			// Send a successful response on creation
			res.status(201).json({ picture: picture.toObject() })
		})
		.catch(next)
})

// UPDATE
// PATCH - edit picture
router.patch("/pictures/:id", requireToken, removeBlanks, (req, res, next) => {
	// Prevent the client from changing the picture owner
	delete req.body.owner
	Picture.findById(req.params.id)
		.then(handle404)
		.then(picture => {
			requireOwnership(req, picture)
			return picture.updateOne(req.body.picture)
		})
		.then(() => res.sendStatus(204))
		.catch(next)
})

// REMOVE
// DELETE - delete specific picture
router.delete("/pictures/:id", requireToken, (req, res, next) => {
	Picture.findById(req.params.id)
		.then(handle404)
		.then(picture => {
			requireOwnership(req, picture)
			picture.deleteOne()
		})
		.then(() => res.sendStatus(204))
		.catch(next)
})

module.exports = router
