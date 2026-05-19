const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleWare/aouthMiddleWare');
const adminController = require('../controllers/adminController');

router.route('/users')
    .get(protect, adminOnly, adminController.getAllUsers);

router.route('/users/:id')
    .delete(protect, adminOnly, adminController.deleteUser);

router.route('/users/:id/toggle')
    .patch(protect, adminOnly, adminController.toggleUser);

router.route('/services')
    .get(protect, adminOnly, adminController.getAllServices);

router.route('/services/:id')
    .delete(protect, adminOnly, adminController.deleteService);

router.route('/requests')
    .get(protect, adminOnly, adminController.getAllRequests);

router.route('/ratings/:id')
    .delete(protect, adminOnly, adminController.deleteRating);

module.exports = router;