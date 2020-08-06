const utils = require("./tinyAppUtils");
//this class holds the user database structure for the app.
//I added some helper methods that are specific to operations that would be performed on the users database.
class tinyDatabase {
  constructor() {
    this.users = {
      "User22": {
        id: "User22",
        email: "dave22@rogers.com",
        password: utils.hashPassword("test")
      }
    };
  }
  //add a user to the database. the password parameter is hashed prior to this call.
  addUser(email, password) {
    const id = utils.generateRandomString();//create random id for new user.
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

module.exports  = {tinyDatabase};