const User = require('../models/userModel');
const Service = require('../models/serviceModel');
const Request = require('../models/requestModel');
const Rating = require('../models/ratingModel');

// GET /api/admin/users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
        res.status(200).json({ total: users.length, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot delete admin account' });
        }
        await user.deleteOne();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/admin/services
const getAllServices = async (req, res) => {
    try {
        const services = await Service.find()
            .populate('provider', 'name email');
        res.status(200).json({ total: services.length, services });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/admin/services/:id
const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        await service.deleteOne();
        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/admin/requests
const getAllRequests = async (req, res) => {
    try {
        const requests = await Request.find()
            .populate('client', 'name email')
            .populate('provider', 'name email')
            .populate('service', 'title');
        res.status(200).json({ total: requests.length, requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/admin/ratings/:id
const deleteRating = async (req, res) => {
    try {
        const rating = await Rating.findById(req.params.id);
        if (!rating) {
            return res.status(404).json({ message: 'Rating not found' });
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

        res.status(200).json({ message: 'Rating deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH /api/admin/users/:id/toggle
const toggleUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot deactivate admin account' });
        }
        user.isActive = !user.isActive;
        await user.save();
        res.status(200).json({ message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAllUsers, deleteUser, getAllServices, deleteService, getAllRequests, deleteRating, toggleUser };