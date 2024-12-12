const { success, failure } = require("../utilities/common");
const HTTP_STATUS = require("../constants/statusCodes");
const Availability = require("../model/availability.model");
const User = require("../model/user.model");
const Nootification = require("../model/notification.model");

const addAvailability = async (req, res) => {
  try {
    const { availableDate, doctorId } = req.body;

    if (!availableDate || availableDate === "" || !doctorId) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please provide availableDate"));
    }

    const newAvailability = new Availability({
      availableDate,
      doctor: doctorId && doctorId,
    });

    if (!newAvailability) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Availability could not be added"));
    }
    await newAvailability.save();
    return res
      .status(HTTP_STATUS.CREATED)
      .send(success("Availability added successfully", newAvailability));
  } catch (err) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Error adding service", err.message));
  }
};

const updateServiceById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Please provide service id"));
    }
    const service = await Availability.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!service) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Service not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully updated service", service));
  } catch (error) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure(error.message));
  }
};

const getAllServices = async (req, res) => {
  try {
    const { hasDateTime } = req.query;
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    let query = { isDeleted: false };

    console.log(typeof hasDateTime);

    if (hasDateTime === "true") {
      query.dateTimes = { $ne: [] };
    } else if (hasDateTime === "false") {
      query.dateTimes = { $eq: [] };
    }

    const services = await Availability.find(query)
      .populate({
        path: "doctor",
        select: "-notifications -nhsNumber -balance -__v",
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const count = await Availability.countDocuments(query);

    if (!services) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Services not found"));
    }
    return res.status(HTTP_STATUS.OK).send(
      success("Successfully received all services", {
        result: services,
        count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      })
    );
  } catch (error) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Error fetching services", error.message));
  }
};

const getServiceById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Please provide service id"));
    }
    const service = await Availability.findById(req.params.id);
    if (!service) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Service not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully received service", service));
  } catch (error) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Error fetching service", error.message));
  }
};

const getAvailabilityByDoctorId = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Please provide doctor id"));
    }
    const availability = await Availability.find({ doctor: req.params.id });
    if (!availability) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("availability not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully received availability", availability));
  } catch (error) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Error fetching availability", error.message));
  }
};

module.exports = {
  addAvailability,
  getAllServices,
  getServiceById,
  getAvailabilityByDoctorId,
  updateServiceById,
};
