const Rating = require("../models/ratingModel");
const Service = require("../models/serviceModel");


// Add Rating

const addRating = async (req, res) => {

    try {

        const {

            provider,
            service,
            rating,
            comment

        } = req.body;


        // Check if already rated

        const alreadyRated =
            await Rating.findOne({

                client: req.user._id,

                service

            });


        if (alreadyRated) {

            return res.status(400).json({

                message:
                    "You already rated this service"

            });

        }


        const newRating =
            await Rating.create({

                client: req.user._id,

                provider,

                service,

                rating,

                comment

            });

            const allRatings = await Rating.find({ service });
        const average = allRatings.reduce((acc, r) => acc + r.rating, 0) / allRatings.length;

        await Service.findByIdAndUpdate(service, {
            'rating.average': Math.round(average * 10) / 10,
            'rating.count': allRatings.length
        });


        res.status(201).json(newRating);

    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};


// Get Service Ratings

const getServiceRatings =
    async (req, res) => {

        try {

            const ratings =
                await Rating.find({ service: req.params.serviceId})
                .populate(
                        "client",
                        "name"
                    )

                    .sort({createdAt: -1 });
            res.status(200).json(ratings);
            
            } catch (error) {

            res.status(500).json({

                message: error.message

            });

        }

    };


// Delete Rating

const deleteRating =
    async (req, res) => {

        try {

            const rating =await Rating.findById(req.params.id);

            if (!rating) {
                return res.status(404).json({message: "Rating not found"
                });
            }

            // Only owner can delete

            if (rating.client.toString()!==req.user._id.toString()) {
                return res.status(401).json({message: "Not authorized"
                });
            }

            await rating.deleteOne();

            const allRatings = await Rating.find({ service: rating.service });
        const average = allRatings.length
            ? allRatings.reduce((acc, r) => acc + r.rating, 0) / allRatings.length
            : 0;

        await Service.findByIdAndUpdate(rating.service, {
            'rating.average': Math.round(average * 10) / 10,
            'rating.count': allRatings.length
        });

            res.status(200).json({

                message:
                    "Rating deleted"

            });

        } catch (error) {

            res.status(500).json({

                message: error.message

            });

        }

    };


module.exports = {

    addRating,

    getServiceRatings,

    deleteRating

};