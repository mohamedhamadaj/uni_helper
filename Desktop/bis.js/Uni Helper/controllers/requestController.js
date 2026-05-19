const Request = require('../models/requestModel');
const Service = require('../models/serviceModel');

// POST /api/requests  — client sends a request
const createRequest = async (req, res) => {
    try {
        const { serviceId, notes } = req.body;

        const service = await Service.findById(serviceId).populate('provider', 'name email');
        if (!service || !service.isActive) {
            return res.status(404).json({ message: 'Service not found or inactive' });
        }
        if (service.provider._id.toString() === req.user.id) {
            return res.status(400).json({ message: 'You cannot request your own service' });
        }

        const deliveryDeadline = new Date();
        if (service.deliveryTime.unit === 'hours') {
            deliveryDeadline.setHours(deliveryDeadline.getHours() + service.deliveryTime.value);
        } else {
            deliveryDeadline.setDate(deliveryDeadline.getDate() + service.deliveryTime.value);
        }

        const request = await Request.create({
            service: service._id,
            client: req.user.id,
            provider: service.provider._id,
            price: service.price.amount,
            notes,
            deliveryDeadline
        });

        await request.populate([
            { path: 'client', select: 'name email' },
            { path: 'service', select: 'title' }
        ]);

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/requests/my  — client sees their requests
const getMyRequests = async (req, res) => {
    try {
        const requests = await Request.find({ client: req.user.id })
            .populate('service', 'title images')
            .populate('provider', 'name avatar email')
            .sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/requests/received  — provider sees requests they received
const getReceivedRequests = async (req, res) => {
    try {
        const requests = await Request.find({ provider: req.user.id })
            .populate('service', 'title images')
            .populate('client', 'name avatar email')
            .sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/requests/:id
const getRequest = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id)
            .populate('service', 'title description images price')
            .populate('client', 'name avatar email')
            .populate('provider', 'name avatar email');

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const isInvolved =
            request.client._id.toString() === req.user.id ||
            request.provider._id.toString() === req.user.id;

        if (!isInvolved) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH /api/requests/:id/status  — provider updates status
const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatus = ['accepted', 'in_progress', 'delivered', 'cancelled'];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const request = await Request.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        if (request.provider.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (['completed', 'cancelled'].includes(request.status)) {
            return res.status(400).json({ message: 'Cannot update this request' });
        }

        request.status = status;
        if (status === 'cancelled') {
            request.cancelledAt = new Date();
            request.cancelReason = req.body.reason || 'No reason provided';
        }

        await request.save();

        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH /api/requests/:id/complete  — client confirms completion
const completeRequest = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        if (request.client.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (request.status !== 'delivered') {
            return res.status(400).json({ message: 'Request has not been delivered yet' });
        }

        request.status = 'completed';
        request.completedAt = new Date();
        await request.save();

        await Service.findByIdAndUpdate(request.service, { $inc: { totalOrders: 1 } });

        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createRequest,
    getMyRequests,
    getReceivedRequests,
    getRequest,
    updateStatus,
    completeRequest
};