const Service = require('../models/serviceModel');

// GET /api/services
const getAllServices = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

    const filter = { isActive: true };

    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };
    if (minPrice || maxPrice) {
      filter['price.amount'] = {};
      if (minPrice) filter['price.amount'].$gte = Number(minPrice);
      if (maxPrice) filter['price.amount'].$lte = Number(maxPrice);
    }

    const sortOptions = {
      newest:     { createdAt: -1 },
      rating:     { 'rating.average': -1 },
      price_asc:  { 'price.amount': 1 },
      price_desc: { 'price.amount': -1 },
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const services = await Service.find(filter)
      .populate('provider', 'name avatar rating university')
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit));

    const total = await Service.countDocuments(filter);

    res.status(200).json({
      results: services.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      services,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/services/:id
const getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'name avatar bio rating university faculty year');

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/services
const createService = async (req, res) => {
  try {
    const { title, description, category, price, deliveryTime, tags} = req.body;

    const service = await Service.create({
      provider: req.user.id,
      title,
      description,
      category,
      price,
      deliveryTime,
      tags,
    });

    res.status(201).json(service);
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/services/:id
const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    if (service.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const allowed = ['title', 'description', 'category', 'price', 'deliveryTime', 'tags', 'isActive'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) service[field] = req.body[field];
    });

    await service.save();

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/services/:id
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    if (service.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await service.deleteOne();

    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/services/my
const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllServices, getService, createService, updateService, deleteService, getMyServices };