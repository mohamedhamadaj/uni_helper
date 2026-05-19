const express = require('express');
const router = express.Router();

const usercontroller = require('../controllers/userController');

const {protect} = require('../middleWare/aouthMiddleWare');

router.route('/registerUser').post(usercontroller.registerUser);

router.route('/login').post(usercontroller.login);

router.route('/profile').get(protect, usercontroller.getProfile);
router.route('/editProfile').patch(protect, usercontroller.editProfile);
router.route('/changePassword').patch(protect, usercontroller.changePassword);

module.exports = router;