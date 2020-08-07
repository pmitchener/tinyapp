//this file holds the urls database for the app.
const utils = require("./tinyAppUtils");

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "User22",
    dateCreated: 1596766556171,
    visited:1
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "User22",
    dateCreated: 1596766556171,
    visited:1
  },
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW" ,
    dateCreated: 1596766556171,
    visited:1
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
    dateCreated: 1596766556171,
    visited:1
  }
};

//This method returns all the urls that belong to a particular usr id
const urlsForUser = (id) => {
  const urlDb = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urlDb[key] = 
      {
        longURL: urlDatabase[key].longURL,
        dateCreated: utils.getDisplayDateFromTimeStamp(urlDatabase[key].dateCreated),
        visited: urlDatabase[key].visited
      };
    }
  }
  return urlDb;
};
//this method validate whether the current user created the url they are attempting to modify.
const isOwnerOfUrl = (userId, urlId) => {
  for (const key in urlDatabase) {
    if (key === urlId) {
      return urlDatabase[key].userID === userId;
    }
  }
  return false;
};

module.exports = {
  urlDatabase,
  urlsForUser,
  isOwnerOfUrl
};