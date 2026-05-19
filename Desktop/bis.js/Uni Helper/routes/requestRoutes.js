const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { protect, providerOnly, userOnly } = require('../middleWare/aouthMiddleWare');

router.route('/')
    .post(protect, userOnly, requestController.createRequest);

router.route('/my')
    .get(protect, requestController.getMyRequests);

router.route('/received')
    .get(protect, providerOnly, requestController.getReceivedRequests);

router.route('/:id')
    .get(protect, requestController.getRequest);

router.route('/:id/status')
    .patch(protect, providerOnly, requestController.updateStatus);

router.route('/:id/complete')
    .patch(protect, requestController.completeRequest);

module.exports = router;