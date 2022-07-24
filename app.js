//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");

const app = express();

app.set('view engine', 'ejs');                      // set the view engine to ejs
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));                  //Serve  css file

mongoose.connect("mongodb://localhost:27017/userdb", {useNewUrlParser: true});
const userSchema = new mongoose.Schema ({                                        
    name: String,
    password: String
});

const User = mongoose.model("User", userSchema);  


app.get("/", (req,res) => {
    res.render("home");
});

app.get("/login", (req,res) => {
    res.render("login");
});

app.get("/register", (req,res) => {
    res.render("register");
});

app.get("/logout", (req,res) => {
    res.render("home");
});

//__________________________________________________________________________________

app.post("/register", (req,res) => {
    const newUser =  new User({
        name: md5(req.body.username),               //md5 hashing
        password: md5(req.body.password)
    });
    newUser.save((err) => {
        if(err) {
            console.log(err);
        } else {
            res.render("login");
        }
    });
});

app.post("/login", (req,res) => {
    const userName = md5(req.body.username);
    const password = md5(req.body.password);
    User.findOne({email : userName, password : password},(err, foundUser) => {
        if(err) {
            console.log(err);
        } else if (foundUser) {
            res.render("secrets");
        } else {
            res.status(404).send("<h1>Wrong Username OR password</h1>");
        };

    });
});


 


app.listen(3000,  () => {
    console.log("Server is running at port 3000");
});
