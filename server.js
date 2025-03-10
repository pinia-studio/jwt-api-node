﻿const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const config = require("./config.json");
const users = require("./users");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.get("/user/profile", verifyJwt, (req, res) => {
  return res.json({
    ...req.auth,
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) return res.status(401).send({ message: "The Username or Password is Incorrect" });

  // create a jwt token that is valid for 7 days
  const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: "30d" });

  return res.json({
    user: {
      ...omitPassword(user),
    },
    authToken: token,
  });
});

// app.use(express.static('public'))

// start server
const port = process.env.NODE_ENV === "production" ? 80 : 4000;

app.listen(port, function () {
  console.log("Server listening on port " + port);
});

module.exports = app;

function omitPassword(user) {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

function verifyJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (typeof authHeader != "string") {
    return res.sendStatus(403);
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, config.secret, (error, decode) => {
    if (error) return res.sendStatus(403);

    const user = users.find((u) => u.id === decode.sub);
    req.auth = {
      user: {
        ...omitPassword(user),
      },
      auth: true,
    };
    next();
  });
}
