const Session = require("../models/Session");
const User = require("../models/User");
const io = require("../socket");

exports.getRoom = (req, res, next) => {
  const id = req.params.id;
  Session.findById(id)
    .sort({ "streamData.createAt": 1 })
    .populate({ path: "streamData.user", select: "role" })
    .then((session) => {
      if (
        session.customerCreated.toString() === req.session.user._id.toString()
      ) {
        return res.send(session);
      } else {
        return res.status(401).send({ message: "Access Denied!" });
      }
    });
};

exports.getRoomAdmin = (req, res, next) => {
  const id = req.params.id;
  Session.findById(id)
    .populate({ path: "streamData.user", select: "role" })
    .then((session) => {
      return res.send(session);
    });
};

exports.getRooms = (req, res, next) => {
  Session.find().then((sessions) => {
    res.send(sessions);
  });
};

exports.createRoomChat = (req, res, next) => {
  const content = req.body.content;
  User.findById(req.session.user._id).then((user) => {
    if (!user) {
      return res.status(401).send({ message: "Unauthorized!" });
    } else {
      const session = new Session({
        customerCreated: user._id,
        streamData: [{ createAt: new Date(), content, user: user._id }],
      });
      session.save().then((result) => {
        Session.findById(result._id)
          .populate({ path: "streamData.user", select: "role" })
          .then((session) => {
            io.getIO().emit("onChat", { action: "push", session: session });
            return res.send({
              message: "Created Room!",
              session,
            });
          });
      });
    }
  });
};

exports.pushMessage = (req, res, next) => {
  const id = req.params.id;
  const content = req.body.content;

  Session.findById(id).then((session) => {
    if (
      session.customerCreated.toString() === req.session.user._id.toString()
    ) {
      return session
        .pushMessage(content, req.session.user._id.toString())
        .then((result) => {
          Session.findById(result._id)
            .populate({ path: "streamData.user", select: "role" })
            .then((session) => {
              io.getIO().emit("chat", { action: "push", session: session });
              return res.send(session);
            });
        });
    } else {
      return res.status(401).send({ message: "Access Denied!" });
    }
  });
};

exports.pushMessageAdmin = (req, res, next) => {
  const id = req.params.id;
  const content = req.body.content;
  Session.findById(id).then((session) => {
    return session
      .pushMessage(content, req.session.user._id.toString())
      .then((result) => {
        Session.findById(result._id)
          .populate({ path: "streamData.user", select: "role" })
          .then((session) => {
            io.getIO().emit("chat", { action: "push", session: session });
            return res.send(session);
          });
      });
  });
};
