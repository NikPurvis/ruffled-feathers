// models/pictures.js

const mongoose = require("mongoose")
const { Schema, model } = mongoose

const commentSchema = require("./comment")

const pictureSchema = new Schema(
    {
        source: {
            type: String,
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

module.exports = model("Picture", pictureSchema)
