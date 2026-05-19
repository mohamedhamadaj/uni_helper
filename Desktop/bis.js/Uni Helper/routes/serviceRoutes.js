const express = require('express');
const { protect, providerOnly } = require('../middleWare/aouthMiddleWare');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

router.route('/')
    .get(serviceController.getAllServices)
    .post(protect, providerOnly, serviceController.createService);

router.route('/my')
    .get(protect, providerOnly, serviceController.getMyServices);

router.route('/:id')
    .get(serviceController.getService)
    .patch(protect, providerOnly, serviceController.updateService)
    .delete(protect, providerOnly, serviceController.deleteService);

module.exports = router;