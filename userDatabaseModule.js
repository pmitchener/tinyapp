//this class holds the user database structure for the app.
//I added some helper methods that are specific to operations that would be performed on the users database.
class tinyDatabase {
  constructor() {
    this.users = {
      "User22": {
        id: "User22",
        email: "dave22@rogers.com",
        password: "test"
      }
    };
  }
}

module.exports  = {tinyDatabase};