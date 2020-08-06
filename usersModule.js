const utils = require("./tinyAppUtils");
  //add a user to the database. the password parameter is hashed prior to this call.
  const addUser = (email, password, database) => {
    const id = utils.generateRandomString();//create random id for new user.
    database.users[id] = {
      id,
      email,
      password
    };
    return id;
  };
  //Check to see if the new email is available to use before allowing user to register with that email.
  const emailAvailable = (email, database) => {
    for (const key in database.users) {
      if (database.users[key].email === email) {
        return false;
      }
    }
    return true;
  };
  //search for email address based on a given user id
  const getUserEmailById = (user_Id,  database) => {
    if (!database.users[user_Id]) {
      return '';
    }
    return database.users[user_Id].email;
  };
  //search for user id based on a given email address
  const getUserIdByEmail = (email, database) => {
    for (const key in database.users) {
      if (database[key].email === email) {
        return key;
      }
    }
    return '';
  };
  //return a user object based ona given email address. if nothing is found return null to the caller.
  //caller should handle nulls.
  const getUser = (email, database) => {
    for (const key in database.users) {
      if (database.users[key].email === email) {
        return database.users[key];
      }
    }
    return null;
  };

  //this function will validate a user before allowing logon to the app.
const authenticateUser = (email, password, database) => {
  const userObj = getUser(email, database);
  if (!userObj) {
    return '';
  }
  if (!utils.validateHashedPassword(password, userObj.password)) {
    return '';
  }
  return userObj.id;
};

module.exports = {
  addUser,
  emailAvailable,
  getUserEmailById,
  getUserIdByEmail,
  getUser,
  authenticateUser
}