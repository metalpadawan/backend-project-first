const express = require("express")
const app = express()

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }))
// In order to access username and passwords input, you need to enable it in express: app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))

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
    if (!req.body.password && req.body.password.length < 3) errors.push("Password must be at least 3 characters long")
    if (!req.body.password && req.body.password.length > 10) errors.push("Password must be at most 10 characters long")
    if (req.body.password && !req.body.password.match(/^[a-zA-Z0-9]+$/)) errors.push("Password must contain at least one lowercase letter")
    if (errors.length) {
        return res.render("homepage", {errors})
    }   else {
        res.send("Registered successfully")
    // End the request and paste message in the browser
    }
    
    
})

app.listen(3000)
// Listen on port 3000
// this will allow for browser to pick up on webpage