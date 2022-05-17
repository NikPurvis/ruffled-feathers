// models/sightings.js

const mongoose = require("mongoose")
const { Schema, model } = mongoose

const commentSchema = require("./comment")

const sightingSchema = new Schema(
    {
        where_seen: {
            type: String,
            required: true
        },
        when_seen: {
            type: Date,
            default: Date.now,
            required: true
        },
        weather: {
            type: String,
            enum: ["sun", "overcast", "rain", "snow"],
            required: true
        },
        description: {
            type: String,
            required: true
        },
        comments: [commentSchema],
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

module.exports = model("Sighting", sightingSchema)
