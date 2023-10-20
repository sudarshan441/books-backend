require("dotenv").config();
const { Router } = require("express");
const UserModel = require("./user.model");
const app = Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_TOKEN = process.env.JWT_SECRET_KEY;

app.get("/", async (req, res) => {
  try {
    let data = await UserModel.find();
    return res.status(200).send(data);
  } catch (er) {
    return res.status(404).send(er.message);
  }
});

// Login Route
app.post("/login", async (req, res) => {

  const { email, password } = req.body;

 console.log(email,password)

  if (!email || !password) {
    return res.status(403).send("Enter Credianteials");
  }
  const User = await UserModel.findOne({ email });
 // console.log(User)
 // if (!User) return res.status(404).send("User Not Found");
  try {
    const match = bcrypt.compareSync(password, User.password);
   console.log(match)
    if (match) {
      //login
      const token = jwt.sign(
        {
          _id: User.id,
          name: User.username,
          email:User.email,
          password: User.password,
        },
        SECRET_TOKEN,
        {
          expiresIn: "7 days",
        }
      );
      return res
        .status(200)
        .send({ message: "Login success", token});
    } else {
      return res.status(401).send({ message: "Authentication Failed" });
    }
  } catch {
    return res.status(401).send({ message: "Authentication Failed" });
  }
});

// Signup Route
app.post("/signup", async (req, res) => {
  const {
    username,
    email,
    password,

  } = req.body;

  console.log(req.body)

  if (!email || !password || !username) {
    return res.status(403).send("Enter Credentails");
  }
  try {
    const exsist = await UserModel.findOne({ email });
    if (exsist)
      return res
        .status(403)
        .send({ message: "User Already Created Try Logging in" });

    bcrypt.hash(password, 6, async function (err, hash) {
      if (err) {
        return res.status(403).send({ message: "Connection has failed" });
      }

      const user = await UserModel({
        email,
        username,
        password: hash,
      });

      await user.save();
      return res.status(200).send({ message:"successfully created" });
    });
  } catch (er) {
    return res.status(404).send(er.message);
  }
});

module.exports = app;