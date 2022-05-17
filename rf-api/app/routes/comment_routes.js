// routes/comment_routes.js

// Import dependencies
const express = require("express")
const { ObjectId } = require("mongodb")
const passport = require("passport")

// Import middleware
const customErrors = require("../../lib/custom_errors")
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const requireToken = passport.authenticate("bearer", { sesson: false })
const removeBlanks = require("../../lib/remove_blank_fields")

// Import models
const Sighting = require("../models/sighting")
// const Picture = require("../models/picture")

// Instantiate router
const router = express.Router()


// CREATE
// POST - create a comment
router.post("/comment/:sightingId", requireToken, removeBlanks, (req, res, next) => {
	const comment = req.body.comment
    const sightingId = req.params.sightingId
    req.body.comment.owner = req.user.id

	Sighting.findById(sightingId)
        .then(handle404)
        .then(sighting => {
            console.log("This is the sighting:", sighting)
            console.log("This is the comment:", comment)
            sighting.comments.push(comment)
            return sighting.save()
        })
        .then(sighting => res.status(201).json({ sighting: sighting }))
        .catch(next)    
})

// SHOW
// GET - retrieve a comment
router.get("/comment/:sightingId/:commentId", (req, res, next) => {
    const sightingId = req.params.sightingId
    const commentId = req.params.commentId
    Sighting.findOne(
        { "_id": ObjectId(sightingId) },
        { "comments": {
            $elemMatch: { _id: ObjectId(commentId) } }
        }
    )
    .populate("owner")
    .then(handle404)
    .then(sighting => res.status(200).json({
        sighting: sighting.toObject() }))
    .catch(next)
})


module.exports = router
