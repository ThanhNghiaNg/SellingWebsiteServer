const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  customerCreated: { type: Schema.Types.ObjectId, require: true, ref: "User" },
  streamData: [
    {
      createAt: { type: Date, require: true },
      content: { type: String, require: true },
      user: { type: Schema.Types.ObjectId, require: true, ref: "User" },
    },
  ],
});

sessionSchema.methods.pushMessage = function (message, userId) {
  const streamDataUpdated = [...this.streamData];
  streamDataUpdated.push({
    createAt: new Date(),
    content: message,
    user: new mongoose.Types.ObjectId(userId),
  });
  this.streamData = [...streamDataUpdated];
  return this.save();
};

module.exports = mongoose.model("Session", sessionSchema);
