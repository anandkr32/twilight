
const validator = require('validator');

const validateSignupData = (req) => {
  const { name, email, password } = req.body;
  if (!name)  {
    throw new Error("Enter A valid name");
  } else if (!validator.isEmail(email)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Passoword is not strong");
  } 
};

module.exports = { validateSignupData };
