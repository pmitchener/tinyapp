const saltRounds = 10;
let _hsher;//used to hash user password. bcrypt will be used.

const setHasher = (hsher) => {
  _hsher = hsher;
};
//generate a random alpha numeric id.
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
//Create hash of new user password
//TODO: try out the async version of the bcrypt hashing method
const hashPassword = (password) => {
  return _hsher.hashSync(password, saltRounds);
};
//validate user password for logon to the app.
//TODO: try out the async version of the bcrypt compare function.
const validateHashedPassword = (password, hshpassword) => {
  return _hsher.compareSync(password, hshpassword);
};

module.exports = {
  generateRandomString,
  getValidURLFormat,
  hashPassword,
  validateHashedPassword,
  setHasher
};