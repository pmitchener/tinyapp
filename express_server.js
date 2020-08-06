const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");

const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");

const saltRounds = 10;

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
const hashPassword = (password) => {
  return bcrypt.hashSync(password, saltRounds);
};
const validateHashedPassword = (password, hshpassword) => {
  return bcrypt.compareSync(password, hshpassword);
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "User22"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "User22"},
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
const urlsForUser = (id) => {
  const urlDb = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urlDb[key] = {longURL: urlDatabase[key].longURL};
    }
  }
  return urlDb;
};
const isOwnerOfUrl = (user_Id, url_Id) => {
  for (const key in urlDatabase) {
    if (key === url_Id) {
      return urlDatabase[key].userID === user_Id;
    }
  }
  return false;
};
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
  addUser(email, password) {
    const id = generateRandomString();
    this.users[id] = {
      id,
      email,
      password
    };
    return id;
  }
  emailAvailable(email) {
    for (const key in this.users) {
      if (this.users[key].email === email) {
        return false;
      }
    }
    return true;
  }
  getUserEmailById(user_Id) {
    if (!this.users[user_Id]) {
      return '';
    }
    return this.users[user_Id].email;
  }
  getUserIdByEmail(email) {
    for (const key in this.users) {
      if (this.users[key].email === email) {
        return key;
      }
    }
    return '';
  }
  getUser(email) {
    for (const key in this.users) {
      if (this.users[key].email === email) {
        return this.users[key];
      }
    }
    return null;
  }
}
let userDatabase = new tinyDatabase();
const authenticateUser = (email, password) => {
  const userObj = userDatabase.getUser(email);
  if (!userObj) {
    return '';
  }
  //if (userObj.password !== password) {
  if (!validateHashedPassword(password, userObj.password)) {
    return '';
  }
  return userObj.id;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/login", (req, res) => {
  let templateVars = {
    email:'',
    bad_login:''
  };
  res.render("user_login", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {
    email:'',
    bad_register:''
  };
  res.render("user_register", templateVars);
});
app.get("/urls", (req, res) => {
  let email = userDatabase.getUserEmailById(req.cookies.user_Id);
  if (!email) {
    res.redirect("/login");
    return;
  }
  let templateVars = {
    urls:urlsForUser(req.cookies.user_Id),
    email
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let email = userDatabase.getUserEmailById(req.cookies.user_Id);
  if (!email) {
    res.redirect("/login");
    return;
  }
  let templateVars = {
    email
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let email = userDatabase.getUserEmailById(req.cookies.user_Id);
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

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  let email = userDatabase.getUserEmailById(req.cookies.user_Id);
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

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

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
    res.cookie("user_Id", user_Id);
    res.redirect("/urls");
  }
});

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
    res.cookie("user_Id", user_Id);
    res.redirect("/urls");
  }
});
app.post("/logout", (req, res) => {
  res.clearCookie("user_Id");
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let email = userDatabase.getUserEmailById(req.cookies.user_Id);
  if (!email) {
    res.redirect("/login");
    return;
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: getValidURLFormat(req.body.longURL),
    userID: req.cookies.user_Id
  };
  res.redirect(`/urls`);
});

app.post("/urls/:id/:action", (req, res) => {
  let email = userDatabase.getUserEmailById(req.cookies.user_Id);
  if (!email) {
    res.redirect("/login");
    return;
  }
  const url_Id = req.params.id;
  if (!isOwnerOfUrl(req.cookies.user_Id, url_Id)) {
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
      userID: req.cookies.user_Id
    };
    break;
  default:
    break;
  }
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});