//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

app.set('view engine', 'ejs');                      // set the view engine to ejs
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));                  //Serve  css file
//______________________________________________________________session

app.use(session({
    secret: "our little secret.",
    resave: false,
    saveUninitialized: false
}));

//______________________________________________________________passport

app.use(passport.initialize());
app.use(passport.session());

//______________________________________________________________mongo db schema & plugin
mongoose.connect("mongodb://localhost:27017/userdb", {useNewUrlParser: true});
// mongoose.set("useCreateIndex, true");

const userSchema = new mongoose.Schema ({                                        
    name: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);  

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req,res) => {
    res.render("home");
});

app.get("/login", (req,res) => {
    res.render("login");
});

app.get("/register", (req,res) => {
    res.render("register");
});

app.get("/secrets", (req,res) => {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    };  
});

app.get("/logout", (req,res) => {
    req.logout((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        };
    });
});

//__________________________________________________________________________________

app.post("/register", (req,res) => {

    User.register(new User({ username : req.body.username }), req.body.password, (err, User) => {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            res.redirect("/login");
        };
    });
});

app.post("/login", (req,res) => {
    const user = new User({
        username : req.body.username,
        password : req.body.password
    });

    req.login(user, (err) => {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate('local')(req, res, function () {
                res.redirect("/secrets");
                });
        };
    });
});








app.listen(3000,  () => {
    console.log("Server is running at port 3000");
});