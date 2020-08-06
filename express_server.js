const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080

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
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

class tinyDatabase {
  constructor() {
    this.users = {
      "User22": {
        id: "User22",
        email: "dave22@rogers.com",
        password: "004QAD"
      }
    }
  }
  addUser (email, password) {
    const id = generateRandomString();
    this.users[id] = {
      id,
      email,
      password
    };
    return id;
  }
  emailAvailable (email) {
    for (const key in this.users) {
      if (this.users[key].email === email) {
        return false;
      }
    }
    return true;
  }
  getUserEmailById (user_id) {
    if (!this.users[user_id]) {
      return '';
    }
    return this.users[user_id].email;
  }
  getUserIdByEmail (email) {
    for (const key in this.users) {
      if (this.users[key].email === email) {
        return key;
      }
    }
    return '';
  }
  getUser (email) {
    for (const key in this.users) {
      if (this.users[key].email === email) {
        return this.users[key];
      }
    }
    return null;
  }
  authenticateUser (email, password)  {
    const userObj = this.getUser(email);
    if (!userObj) {
      return '';
    }
    if (userObj.password !== password) {
      return '';
    }
    return userObj.id;
  } 
}
let userDatabase = new tinyDatabase();
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
  let email = userDatabase.getUserEmailById(req.cookies.user_id);
  console.log("req.cookies.user_id", req.cookies.user_id, "email", email);
  let templateVars = {
    urls:urlDatabase,
    email
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let email = userDatabase.getUserEmailById(req.cookies.user_id);
  let templateVars = {
    email
  };  
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  let email = userDatabase.getUserEmailById(req.cookies.user_id);
  if (!longURL) {
    let templateVars = {
      url:req.params.shortURL,
      email
    };
    res.render("urlNotFound", templateVars);
  } else {  
    let templateVars = {
      longURL:longURL, 
      shortURL:req.params.shortURL,
      email
    };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  let email = userDatabase.getUserEmailById(req.cookies.user_id);
  if (!longURL) {
    let templateVars = {
      url:req.params.shortURL,
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
    const user_id = userDatabase.addUser(email.trim(), password);
    res.cookie("user_id", user_id);
    res.redirect("/urls")
  }
});

app.post("/login", (req, res) => {
  const user_id = userDatabase.authenticateUser(req.body.email, req.body.password);
  console.log("user_id", user_id);
  if (!user_id) {
    let templateVars = {
      email:'', 
      bad_login:'Invalid user id and or password.'
    };
    res.statusCode = 403;
    res.render("user_login", templateVars);      
  } else {
    res.cookie("user_id", user_id);
    res.redirect("/urls");
  }
});
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = getValidURLFormat(req.body.longURL);
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/:action", (req, res) => {
  const id = req.params.id;
  const formAction = req.params.action;
  switch(formAction) {
    case "delete":
      delete urlDatabase[id];
      break;
    case "update":
      urlDatabase[id] = getValidURLFormat(req.body.longURL);
      break;
    default:
      break;
  }
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});