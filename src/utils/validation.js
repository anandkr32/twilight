
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

const validateEditUserData = (req) => {
  const allowedEditFields = [
    "name",
    "emailId", 
    "age",
    "address",
    "dob",
    "designation",
    "skills"
  ];
  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );
  return isEditAllowed;
};

module.exports = { validateSignupData, validateEditUserData };
