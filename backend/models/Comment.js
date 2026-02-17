const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  text: String,
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("Comment", commentSchema);