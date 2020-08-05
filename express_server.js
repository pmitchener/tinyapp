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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  let templateVars = {username:''};//username will be undefined.
  res.render("user_login", templateVars);
});
app.get("/urls", (req, res) => {
  let username = req.cookies["username"];
  let templateVars = {
    urls:urlDatabase,
    username
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let username = req.cookies["username"];
  let templateVars = {
    username
  };  
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  let username = req.cookies["username"];
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
  let username = req.cookies["username"];
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