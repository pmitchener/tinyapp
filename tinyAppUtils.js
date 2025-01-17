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

//get current time stamp.
const getCurrentTimeStamp = () =>{
  return Date.now();
}

//format date from time stamp. format: MMM dd, YYYY
const getDisplayDateFromTimeStamp = (timeStmp) => {
  const dtFormatter = new Intl.DateTimeFormat('en', {year: "numeric", weekday: "short", month: "short", day: "2-digit"});
  const formatterResults = dtFormatter.formatToParts(timeStmp);
  const dtValues = {};
  formatterResults.forEach(({type, value}) => {
    switch (type) {
      case 'weekday':
        dtValues['weekday'] = value;
        break;
      case 'month':
        dtValues['month'] = value;
        break;
      case 'day':
        dtValues['day'] = value;
        break;
      case 'year':
        dtValues['year'] = value;
        break;
      default:
        break;
    }
  });
  
  return `${dtValues.month} ${dtValues.day}, ${dtValues.year}`;  
}

module.exports = {
  generateRandomString,
  getValidURLFormat,
  hashPassword,
  validateHashedPassword,
  setHasher,
  getCurrentTimeStamp,
  getDisplayDateFromTimeStamp
};