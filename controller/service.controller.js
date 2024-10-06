const { success, failure } = require("../utilities/common");
const HTTP_STATUS = require("../constants/statusCodes");
const Service = require("../model/service.model");
const User = require("../model/user.model");

const addService = async (req, res) => {
  try {
    const {
      division,
      doctorType,
      dateTimes,
      daysOfWeek,
      consultationType,
      doctorId,
      user,
    } = req.body;

    if (!doctorId) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please provide doctorId"));
    }

    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Doctor does not exist"));
    }

    const newService = new Service({
      division,
      doctorType,
      dateTimes,
      daysOfWeek,
      consultationType,
      doctor: doctorId,
      user,
    });

    doctor.services.push(newService._id);

    await doctor.save();

    if (!newService) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Service not added"));
    }

    await newService.save();
    return res
      .status(HTTP_STATUS.CREATED)
      .send(success("Service added successfully", newService));
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
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
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
    const services = await Service.find().populate({
      path: "doctor",
      select: "-notifications -nhsNumber -balance -__v",
    });
    if (!services) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Services not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully received all services", services));
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
    const service = await Service.findById(req.params.id);
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

const getServiceByDoctorId = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Please provide doctor id"));
    }
    const service = await Service.find({ doctor: req.params.id });
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

const deleteServiceById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Please provide service id"));
    }
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!service) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Service not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully deleted service", service));
  } catch (error) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Error deleting service", error.message));
  }
};

const disableServiceById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Please provide service id"));
    }
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { isDisabled: true },
      { new: true }
    );
    if (!service) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Service not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully disabled service", service));
  } catch (error) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Error disabling service", error.message));
  }
};

const enableServiceById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Please provide service id"));
    }
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { isDisabled: false },
      { new: true }
    );
    if (!service) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Service not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully enabled service", service));
  } catch (error) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Error enabling service", error.message));
  }
};

module.exports = {
  addService,
  getAllServices,
  getServiceById,
  getServiceByDoctorId,
  updateServiceById,
  deleteServiceById,
  disableServiceById,
  enableServiceById,
};
