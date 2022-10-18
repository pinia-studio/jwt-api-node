const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const config = require("./config.json");
const users = require("./users");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.get("/profile", verifyJwt, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  jwt.verify(token, config.secret, (error, decode) => {
    if (error) {
      return res.json({
        auth: false,
        error,
      });
    }

    const user = users.find((u) => u.id === decode.sub);
  
    return res.json({
      user: {
        ...omitPassword(user),
      },
      auth: true,
    });
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) throw "Username or password is incorrect";

  // create a jwt token that is valid for 7 days
  const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: "30d" });

  return res.json({
    ...omitPassword(user),
    token,
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
  next();
}
