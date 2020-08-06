const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const userDB = require("./userDatabaseModule");
const urlsDB = require("./urlsDatabaseModule");
const utils = require("./tinyAppUtils");
const users = require("./usersModule");

const app = express();
app.use(cookieSession({
  name: 'tinyappSession',
  keys: ['Parick', 'Lighthouselabs']
}));
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");

utils.setHasher(bcrypt);
const urlDatabase = urlsDB.urlDatabase;
let userDatabase = new userDB.tinyDatabase();//instantiate a user database.

//get index page. same as GET /urls below for now.
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//show login page
app.get("/login", (req, res) => {
  let templateVars = {
    email:'',
    loginError:''
  };
  res.render("user_login", templateVars);
});

//show register page
app.get("/register", (req, res) => {
  let templateVars = {
    email:'',
    usrRegisterError:''
  };
  res.render("user_register", templateVars);
});

//show all your current urls. This will redirect to logon if user is not logged in.
app.get("/urls", (req, res) => {
  let email = users.getUserEmailById(req.session.userId, userDatabase);
  if (!email) {
    res.redirect("/login");
    return;
  }
  let templateVars = {
    urls:urlsDB.urlsForUser(req.session.userId),
    email
  };
  res.render("urls_index", templateVars);
});

//show urls_new page to allow user to add a new short url. This will redirect to logon if user is not logged in.
app.get("/urls/new", (req, res) => {
  let email = users.getUserEmailById(req.session.userId, userDatabase);
  if (!email) {
    res.redirect("/login");
    return;
  }
  let templateVars = {
    email
  };
  res.render("urls_new", templateVars);
});

//Get the long url for a specific short url for the logged on user. This will redirect to logon if user is not logged in.
app.get("/urls/:id", (req, res) => {
  let email = users.getUserEmailById(req.session.userId, userDatabase);
  if (!email) {
    res.redirect("/login");
    return;
  }
  const urlId = req.params.id;
  if (!urlsDB.isOwnerOfUrl(req.session.userId, urlId)) {
    let templateVars = {
      email
    };
    res.redirect("/cannotModifyUrl"), templateVars;
    return;
  }
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    let templateVars = {
      url:req.params.id,
      email
    };
    res.render("urlNotFound", templateVars);
  } else {
    let templateVars = {
      longURL:longURL,
      shortURL:req.params.id,
      email
    };
    res.render("urls_show", templateVars);
  }
});

//Redirecting to the long url based on the supplied short url.
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  let email = users.getUserEmailById(req.session.userId, userDatabase);
  if (!longURL) {
    let templateVars = {
      url:req.params.id,
      email
    };
    res.render("urlNotFound", templateVars);
  } else {
    res.redirect(utils.getValidURLFormat(longURL));
  }
});

//register a new user
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    let templateVars = {
      email:'',
      usrRegisterError: "Email and password are required."
    };
    res.statusCode = 400;
    res.render("user_register", templateVars);
  } else if (!users.emailAvailable(email, userDatabase)) {
    let templateVars = {
      email:'',
      usrRegisterError: "Email address already in use"
    };
    res.statusCode = 400;
    res.render("user_register", templateVars);
  } else {
    const userId = users.addUser(email.trim(), utils.hashPassword(password), userDatabase);
    req.session.userId = userId;
    res.redirect("/urls");
  }
});

//Validate and logon a user.
app.post("/login", (req, res) => {
  const userId = users.authenticateUser(req.body.email, req.body.password, userDatabase);
  if (!userId) {
    let templateVars = {
      email:'',
      loginError:'Invalid user id and or password.'
    };
    res.statusCode = 403;
    res.render("user_login", templateVars);
  } else {
    req.session.userId = userId;
    res.redirect("/urls");
  }
});

//logout a user and delete their session.
app.post("/logout", (req, res) => {
  req.session.userId = null;
  res.redirect("/urls");
});

//Add a new short url to the url database. This will redirect to logon if user is not logged in.
app.post("/urls", (req, res) => {
  let email = users.getUserEmailById(req.session.userId, userDatabase);
  if (!email) {
    res.redirect("/login");
    return;
  }
  const shortURL = utils.generateRandomString();
  urlDatabase[shortURL] = {
    longURL: utils.getValidURLFormat(req.body.longURL),
    userID: req.session.userId
  };
  res.redirect(`/urls`);
});

//Modiify or delete a short url based on the action parameter.
//This will redirect to logon if user is not logged in.
//Will not allow user to modify/delete urls that they did not create.
app.post("/urls/:id/:action", (req, res) => {
  let email = users.getUserEmailById(req.session.userId, userDatabase);
  if (!email) {
    res.redirect("/login");
    return;
  }
  const urlId = req.params.id;
  if (!urlsDB.isOwnerOfUrl(req.session.userId, urlId)) {
    res.redirect("/urls");
    return;
  }
  const formAction = req.params.action;
  switch (formAction) {
  case "delete":
    delete urlDatabase[urlId];
    break;
  case "update":
    urlDatabase[urlId] = {
      longURL: utils.getValidURLFormat(req.body.longURL),
      userID: req.session.userId
    };
    break;
  default:
    break;
  }
  res.redirect("/urls");
});

//Start the tiny app server.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
