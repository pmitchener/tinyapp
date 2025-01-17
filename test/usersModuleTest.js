const { assert } = require('chai');

//const { getUserByEmail } = require('../helpers.js');

const usersModule  = require("../usersModule");

const testUsers = {
    "users": {
      "userRandomID": {
        id: "userRandomID", 
        email: "user@example.com", 
        password: "purple-monkey-dinosaur"
      },
      "user2RandomID": {
        id: "user2RandomID", 
        email: "user2@example.com", 
        password: "dishwasher-funk"
      }
  }
}

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = usersModule.getUserIdByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.strictEqual(user, expectedOutput);
  });

  it('should return undefined for invalid email', function() {
    const user = usersModule.getUserIdByEmail("user11@example.com", testUsers);
    const expectedOutput = undefined;
    // Write your assert statement here
    assert.strictEqual(user, expectedOutput);
  });  
});