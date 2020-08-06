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

module.exports = {
  urlDatabase,
  urlsForUser,
  isOwnerOfUrl
};