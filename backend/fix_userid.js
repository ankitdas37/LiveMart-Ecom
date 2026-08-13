const fs = require('fs');
const path = require('path');

const addressControllerPath = path.join(__dirname, 'controllers', 'addressController.js');
let addressControllerContent = fs.readFileSync(addressControllerPath, 'utf8');

addressControllerContent = addressControllerContent
  .replace(/UserId/g, 'userId');

fs.writeFileSync(addressControllerPath, addressControllerContent);

const userControllerPath = path.join(__dirname, 'controllers', 'userController.js');
let userControllerContent = fs.readFileSync(userControllerPath, 'utf8');

userControllerContent = userControllerContent
  .replace(/UserId: userId/g, 'userId: userId')
  .replace(/UserId: req.user.id/g, 'userId: req.user.id');

fs.writeFileSync(userControllerPath, userControllerContent);

console.log('Fixed UserId to userId in controllers.');
