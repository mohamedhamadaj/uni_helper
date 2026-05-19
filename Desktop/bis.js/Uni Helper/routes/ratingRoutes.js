const express = require("express");
const router = express.Router();
const { protect } = require("../middleWare/aouthMiddleWare");
const { addRating, getServiceRatings, deleteRating } = require("../controllers/ratingController");

router.route("/")
    .post(protect, addRating);

router.route("/service/:serviceId")
    .get(getServiceRatings);

router.route("/:id")
    .delete(protect, deleteRating);

module.exports = router;