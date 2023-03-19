const express = require("express");
const cors = require("cors");
const multer = require("multer");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const MongoDBStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const User = require("./models/User");

const authRoutes = require("./routes/auth");
const shopRoutes = require("./routes/shop");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const MONGODB_URI =
  "mongodb+srv://owwibookstore:owwibookstore@cluster0.o5luvip.mongodb.net/FUNiXAssignment03?retryWrites=true&w=majority";

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "UserSessions",
});

const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(__dirname));
app.set("trust proxy", 1);

//UNCOMMENT FOR DEPLOY
// app.use(
//   cors({
//     origin: [
//       "https://simpleecomercewebsite.netlify.app",
//       "https://simple-e-comerce-27271.web.app",
//       "https://owwi-ecomerce-admin.netlify.app",
//       "https://owwi-ecomerce.netlify.app",
//     ],
//     methods: ["POST", "PUT", "PATCH", "DELETE", "GET", "OPTIONS", "HEAD"],
//     credentials: true,
//   })
// );

// UNCOMMENT FOR DEVELOP
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).array("files")
);

app.use(
  session({
    secret: "SESSION_SECRET",
    saveUninitialized: false,
    resave: false,
    store: store,
    // cookie: {
    //   // sameSite: "none", // UNCOMMENT FOR DEPLOY
    //   // secure: true, // UNCOMMENT FOR DEPLOY
    //   maxAge: 1000 * 60 * 60 * 24, // One day in milliseconds
    // },
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      throw new Error(err);
    });
});

app.use(authRoutes);
app.use(shopRoutes);
app.use(userRoutes);
app.use("/admin", adminRoutes);

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    console.log("connected database");
    const server = app.listen(process.env.PORT || 5000);
    const io = require("./socket").init(server);
    io.on("connection", (socket) => {
      console.log("Client Connected!");
    });
  })
  .catch((err) => {
    console.log(err);
  });
