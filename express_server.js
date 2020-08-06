const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");

const app = express();
app.use(cookieSession({
  name: 'tinyappSession',
  keys: ['Parick', 'Lighthouselabs']
}));
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");

const saltRounds = 10;

//generate a random alpha numeric id.
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};
/*
  This function will make sure that any long url being posted or redirected to is actually a valid url format.
  //if the string does not start with http, the function will assume mal format and pre-pend http:// to the string
  i.e www.msn.com will be changed to http://www.msn.com
  https://yoursecure.com will not be changed.
*/
const getValidURLFormat = (url) => {
  //If url is undefined or empty string, just return the url. This should not happen.
  //The calling method should have already check for this.
  if (!url) {
    url;
  }
  if (!url.toLowerCase().startsWith("http")) {
    return `http://${url}`;
  }
  return url;
};
//Create hash of new user password
//TODO: try out the async version of the bcrypt hashing method
const hashPassword = (password) => {
  return bcrypt.hashSync(password, saltRounds);
};
//validate user password for logon to the app.
//TODO: try out the async version of the bcrypt compare function.
const validateHashedPassword = (password, hshpassword) => {
  return bcrypt.compareSync(password, hshpassword);
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "User22"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "User22"},
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

//This method returns all the urls that belong to a particular usr id
const urlsForUser = (id) => {
  const urlDb = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urlDb[key] = {longURL: urlDatabase[key].longURL};
    }
  }
  return urlDb;
};
//this method validate whether the current user created the url they are attempting to modify.
const isOwnerOfUrl = (user_Id, url_Id) => {
  for (const key in urlDatabase) {
    if (key === url_Id) {
      return urlDatabase[key].userID === user_Id;
    }
  }
  return false;
};
//this class holds the user database structure for the app.
//I added some helper methods that are specific to operations that would be performed on the users database.
class tinyDatabase {
  constructor() {
    this.users = {
      "User22": {
        id: "User22",
        email: "dave22@rogers.com",
        password: hashPassword("test")
      }
    };
  }
  //add a user to the database. the password parameter is hashed prior to this call.
  addUser(email, password) {
    const id = generateRandomString();//create random id for new user.
    this.users[id] = {
      id,
      email,
      password
    };
    return id;
  }
  //Check to see if the new email is available to use before allowing user to register with that email.
  emailAvailable(email) {
    for (const key in this.users) {
      if (this.users[key].email === email) {
        return false;
      }
    }
    return true;
  }
  //search for email address based on a given user id
  getUserEmailById(user_Id) {
    if (!this.users[user_Id]) {
      return '';
    }
    return this.users[user_Id].email;
  }
  //search for user id based on a given email address
  getUserIdByEmail(email) {
    for (const key in this.users) {
      if (this.users[key].email === email) {
        return key;
      }
    }
    return '';
  }
  //return a user object based ona given email address. if nothing is found return null to the caller.
  //caller should handle nulls.
  getUser(email) {
    for (const key in this.users) {
      if (this.users[key].email === email) {
        return this.users[key];
      }
    }
    return null;
  }
}
let userDatabase = new tinyDatabase();//instantiate a user database.

//this function will validate a user before allowing logon to the app.
const authenticateUser = (email, password) => {
  const userObj = userDatabase.getUser(email);
  if (!userObj) {
    return '';
  }
  if (!validateHashedPassword(password, userObj.password)) {
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
    urls:urlsForUser(req.session.user_Id),
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
    res.redirect(getValidURLFormat(longURL));
  }
});

/* app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
}); */

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
    const user_Id = userDatabase.addUser(email.trim(), hashPassword(password));
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
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: getValidURLFormat(req.body.longURL),
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
      longURL: getValidURLFormat(req.body.longURL),
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