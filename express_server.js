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
const users = {
  "Uer22": {
    id: "User22",
    email: "dave22@rogers.com",
    password: "004QAD"
  }
};


const addUser = (email, password) => {
  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password
  };
  return id;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  let templateVars = {
    username:'', 
    bad_register:''
  };
  res.render("user_register", templateVars);
});
app.get("/urls", (req, res) => {
  let username = users[req.cookies.user_id].email;
  let templateVars = {
    urls:urlDatabase,
    username
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let username = users[req.cookies.user_id].email;
  let templateVars = {
    username
  };  
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  let username = users[req.cookies.user_id].email;
  if (!longURL) {
    let templateVars = {
      url:req.params.shortURL,
      username
    };
    res.render("urlNotFound", templateVars);
  } else {  
    let templateVars = {
      longURL:longURL, 
      shortURL:req.params.shortURL,
      username
    };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  let username = users[req.cookies.user_id].email;
  if (!longURL) {
    let templateVars = {
      url:req.params.shortURL,
      username
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
      username:'',
      bad_register: "Email and password are required."
    };
    res.render("user_register", templateVars);    
  } else {
    const user_id = addUser(email, password);
    res.cookie("user_id", user_id);
    res.redirect("/urls")
  }
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});
app.post("/logout", (req, res) => {
  res.clearCookie("username");
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