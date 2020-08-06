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