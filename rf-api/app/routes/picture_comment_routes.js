// routes/picture_comment_routes.js

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
const Picture = require("../models/picture")

// Instantiate router
const router = express.Router()



// SHOW
// GET - retrieve a comment
router.get("/pictures/:pictureId/:commentId", (req, res, next) => {
    const pictureId = req.params.pictureId
    const commentId = req.params.commentId
    Picture.findOne(
        { "_id": ObjectId(pictureId) },
        { "comments": {
            $elemMatch: { _id: ObjectId(commentId) }}
        }
    )
    // .populate("owner")
    .then(handle404)
    .then(picture => res.status(200).json({
        picture: picture.toObject() }))
    .catch(next)
})

// CREATE
// POST - create a comment
router.post("/pictures/:pictureId/comment", requireToken, removeBlanks, (req, res, next) => {
	const comment = req.body.comment
    const pictureId = req.params.pictureId
    req.body.comment.owner = req.user.id

	Picture.findById(pictureId)
        .then(handle404)
        .then(picture => {
            console.log("This is the picture:", picture)
            console.log("This is the comment:", comment)
            picture.comments.push(comment)
            return picture.save()
        })
        .then(picture => res.status(201).json({ picture: picture }))
        .catch(next)    
})

// UPDATE
// PATCH - edit a specific comment
// ** Work in comment owner validation **
router.patch("/pictures/:pictureId/:commentId", requireToken, removeBlanks, (req, res, next) => {
    delete req.body.owner
    const pictureId = req.params.pictureId
    const commentId = req.params.commentId
    const commentUpdate = req.body.comment.text
    Picture.updateOne({
        "_id": ObjectId(pictureId)
    },{
        $set: {
            "comments.$[comments].text": commentUpdate
        }
    },{
        "upsert": false,
        "new": true,
        arrayFilters: [
            {
                "comments._id": {
                    "$eq": ObjectId(commentId)
                }
            }
        ]
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})


// REMOVE
// Delete - delete comment
router.delete("/pictures/:pictureId/:commentId", requireToken, (req, res, next) => {
    const pictureId = req.params.pictureId
    const commentId = req.params.commentId
    Picture.updateOne({
        "_id": ObjectId(pictureId),
        "comments": {
            $elemMatch: { _id: ObjectId(commentId) }
        }
    },{
        $pull: {
            "comments": { "_id": commentId }
        }
    },{
        new: true,
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})


module.exports = router
