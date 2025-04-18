// pull on dependencies at the very top

// for the env to be able to view the environment variables for the b value
require("dotenv").config()
const jwt = require("jsonwebtoken")
// for the webtoken
const bcrypt = require("bcrypt")
// for user data encription on the database
const { name } = require("ejs")
// ejs file
const express = require("express")
// the express is called here

// start of database set up code part 1
// To start call the database launguage and name the app
const db = require("better-sqlite3")("ourApp.db")
// to improve the speed of the database
db.pragma("journal_mode = WAL")
// code to set up database

// database setup here part 2 stores users table
const createTables = db.transaction(() => {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username STRING NOT NULL UNIQUE,
            password STRING NOT NULL
        )
        `).run()
})

createTables()
// creates the table if it doesn't exist
// database setup ends here

const app = express()

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }))
// In order to access username and passwords input, you need to enable it in express: app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))

// code below is called middleware
// middleware is a function that runs before the route handler
app.use(function (req, res, next) {
    res.locals.errors = []
    next()
})

app.get("/", (req, res) => {
    res.render("homepage")
})
// define the route for the homepage

app.get("/login", (req, res) => {
    res.render("login")
})
// Define the route for the login page

app.post("/register", (req, res) => {
    // console.log(req.body)
    // to see it in the console

    const errors = []

    if (typeof req.body.username !== "string") req.body.username =""
    if (typeof req.body.password !== "string") req.body.password =""
    
    req.body.username = req.body.username.trim()

    if (!req.body.username) errors.push("Username is required")
    if (req.body.username && req.body.username.length < 3) errors.push("Username must be at least 3 characters long")
    if (req.body.username && req.body.username.length > 10) errors.push("Username must be at most 10 characters long")
    if (req.body.username && !req.body.username.match(/^[a-zA-Z0-9]+$/)) errors.push("Username must contain at least one lowercase letter")
    
    if (!req.body.password) errors.push("Password is required")
    if (req.body.password && req.body.password.length < 3) errors.push("Password must be at least 3 characters long")
    if (req.body.password && req.body.password.length > 20) errors.push("Password must be at most 10 characters long")
    
    if (errors.length) {
        return res.render("homepage", {errors})
    // }   else {
    //     res.send("Registered successfully")
    // End the request and paste message in the browser
    }

    // save the new user into a database

    // hash the password simply saying hide user information
    const salt = bcrypt.genSaltSync(10)
    req.body.password = bcrypt.hashSync(req.body.password, salt)
    
    const ourStatement = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)")
    const result = ourStatement.run(req.body.username, req.body.password)

    const lookupStatement = db.prepare("SELECT * FROM users WHERE ROWID = ?")
    const ourUser = lookupStatement.get(result.lastInsertRowid)
    // now we can use the ourUser the fill up userid: 4 instead

    // log the user in by giving them a cookie

    // hides the value of the user's cookies using tokens
    // to do that give it a secret value to verify that it was us that gave it that value (a, b the b part check the top for extra setup env)
    // so we don't want to hard code it (userid: 4) instead we'll refer to the part where we saved the database
    const ourTokenValue = jwt.sign({exp: 1, skyColor: "blue", userid: 4}, process.env.JWTSERCET) 
    // to call the cookie, first give it a name
    // second value is what you want the cookie to remember
    // third argument is a configuration object
    res.cookie("ourSimpleApp","supertopsecretvalue", {
        httpOnly: true,
        // this makes is so the clients can't access the cookies in the broswer
        secure: true,
        // this will make the browser only send cookies if it's in http
        sameSite: "strict",
        // to help agaisnt attacks
        maxAge: 1000 * 60 * 60 * 24
        // how long the cookie is good for. it is measured in milisecs
    })

    res.send("Thank you")
})

app.listen(3000)
// Listen on port 3000
// this will allow for browser to pick up on webpage