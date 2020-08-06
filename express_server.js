const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const userDB = require("./userDatabaseHandler");
const urlsDB = require("./urlsDatabaseHandler");
const utils = require("./tinyAppUtils");

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

//this function will validate a user before allowing logon to the app.
const authenticateUser = (email, password) => {
  const userObj = userDatabase.getUser(email);
  if (!userObj) {
    return '';
  }
  if (!utils.validateHashedPassword(password, userObj.password)) {
    return '';
  }
  return userObj.id;
};

//get index page. same as GET /urls below for now.
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//show login page
app.get("/login", (req, res) => {
  let templateVars = {
    email:'',
    bad_login:''
  };
  res.render("user_login", templateVars);
});

//show register page
app.get("/register", (req, res) => {
  let templateVars = {
    email:'',
    bad_register:''
  };
  res.render("user_register", templateVars);
});

//show all your current urls. This will redirect to logon if user is not logged in.
app.get("/urls", (req, res) => {
  let email = userDatabase.getUserEmailById(req.session.user_Id);
  if (!email) {
    res.redirect("/login");
    return;
  }
  let templateVars = {
    urls:urlsDB.urlsForUser(req.session.user_Id),
    email
  };
  res.render("urls_index", templateVars);
});

//show urls_new page to allow user to add a new short url. This will redirect to logon if user is not logged in.
app.get("/urls/new", (req, res) => {
  let email = userDatabase.getUserEmailById(req.session.user_Id);
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
  let email = userDatabase.getUserEmailById(req.session.user_Id);
  if (!email) {
    res.redirect("/login");
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
  let email = userDatabase.getUserEmailById(req.session.user_Id);
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
      bad_register: "Email and password are required."
    };
    res.statusCode = 400;
    res.render("user_register", templateVars);
  } else if (!userDatabase.emailAvailable(email)) {
    let templateVars = {
      email:'',
      bad_register: "Email address already in use"
    };
    res.statusCode = 400;
    res.render("user_register", templateVars);
  } else {
    const user_Id = userDatabase.addUser(email.trim(), utils.hashPassword(password));
    req.session.user_Id = user_Id;
    res.redirect("/urls");
  }
});

//Validate and logon a user.
app.post("/login", (req, res) => {
  const user_Id = authenticateUser(req.body.email, req.body.password);
  if (!user_Id) {
    let templateVars = {
      email:'',
      bad_login:'Invalid user id and or password.'
    };
    res.statusCode = 403;
    res.render("user_login", templateVars);
  } else {
    req.session.user_Id = user_Id;
    res.redirect("/urls");
  }
});

//logout a user and delete their session.
app.post("/logout", (req, res) => {
  //res.clearCookie("user_Id");
  req.session.user_Id = null;
  res.redirect("/urls");
});

//Add a new short url to the url database. This will redirect to logon if user is not logged in.
app.post("/urls", (req, res) => {
  let email = userDatabase.getUserEmailById(req.session.user_Id);
  if (!email) {
    res.redirect("/login");
    return;
  }
  const shortURL = utils.generateRandomString();
  urlDatabase[shortURL] = {
    longURL: utils.getValidURLFormat(req.body.longURL),
    userID: req.session.user_Id
  };
  res.redirect(`/urls`);
});

//Modiify or delete a short url based on the action parameter.
//This will redirect to logon if user is not logged in.
//Will not allow user to modify/delete urls that they did not create.
app.post("/urls/:id/:action", (req, res) => {
  let email = userDatabase.getUserEmailById(req.session.user_Id);
  if (!email) {
    res.redirect("/login");
    return;
  }
  const url_Id = req.params.id;
  if (!isOwnerOfUrl(req.session.user_Id, url_Id)) {
    res.redirect("/urls");
    return;
  }
  const formAction = req.params.action;
  switch (formAction) {
  case "delete":
    delete urlDatabase[url_Id];
    break;
  case "update":
    urlDatabase[url_Id] = {
      longURL: utils.getValidURLFormat(req.body.longURL),
      userID: req.session.user_Id
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
