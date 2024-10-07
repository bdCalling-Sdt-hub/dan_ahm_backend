const Appointment = require("../model/appointment.model");
const Service = require("../model/service.model");
const User = require("../model/user.model");
const { success, failure } = require("../utilities/common");
const HTTP_STATUS = require("../constants/statusCodes");

// Book a service
const bookService = async (req, res) => {
  try {
    const { serviceId, dateTime, dayOfWeek, patientId, type } = req.body;

    const patient = await User.findById(patientId);

    if (!patient) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Patient not found"));
    }

    // Check if the service exists and if it's not deleted or disabled
    const service = await Service.findById(serviceId);
    if (!service || service.isDeleted || service.isDisabled) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Service not found or unavailable"));
    }

    // console.log("dateTime", new Date(dateTime));
    // console.log("dateTime", service.dateTimes);
    // console.log("dateTime", service.dateTimes[1]);
    // console.log("dateTime", service.dateTimes.includes(new Date(dateTime)));

    // Convert the input dateTime to a Date object
    const selectedDateTime = new Date(dateTime).getTime();

    // Check if the requested dateTime is available by comparing timestamps
    const isAvailable = service.dateTimes.some(
      (availableTime) => new Date(availableTime).getTime() === selectedDateTime
    );

    if (!isAvailable) {
      return res
        .status(HTTP_STATUS.CONFLICT)
        .send(failure("Selected time is not available for this service"));
    }

    // // Check if the requested dateTime is available
    // if (!service.dateTimes.includes(new Date(dateTime))) {
    //   return res
    //     .status(HTTP_STATUS.CONFLICT)
    //     .send(failure("Selected time is not available for this service"));
    // }

    // Check if there's already an appointment for this service and time
    const existingAppointment = await Appointment.findOne({
      service: serviceId,
      dateTime: new Date(dateTime),
    });

    if (existingAppointment) {
      return res
        .status(HTTP_STATUS.CONFLICT)
        .send(failure("This time slot is already booked"));
    }

    // Book the appointment
    const appointment = new Appointment({
      serviceId,
      patientId,
      doctorId: service.doctor,
      dateTime: new Date(dateTime),
      dayOfWeek,
      type,
    });

    await appointment.save();

    patient.consultationUpcoming.push(appointment._id);
    await patient.save();

    return res
      .status(HTTP_STATUS.CREATED)
      .send(success("Service successfully booked", { appointment }));
  } catch (err) {
    console.error(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Failed to book the service"));
  }
};

// Cancel a service
const cancelService = async (req, res) => {
  try {
    const { appointmentId, patientId } = req.body;

    // Find the appointment
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: patientId,
      status: "upcoming",
    });

    if (!appointment) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Appointment not found or already cancelled"));
    }

    // Cancel the appointment
    appointment.status = "cancelled";
    await appointment.save();

    return res
      .status(HTTP_STATUS.OK)
      .send(success("Appointment successfully cancelled", { appointment }));
  } catch (err) {
    console.error(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Failed to cancel the appointment"));
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find();
    if (!appointments) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Appointments not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Appointments retrieved successfully", appointments));
  } catch (err) {
    console.error(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Failed to retrieve appointments"));
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Appointment not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Appointment retrieved successfully", appointment));
  } catch (err) {
    console.error(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Failed to retrieve appointment"));
  }
};

const getAppointmentByPatientId = async (req, res) => {
  try {
    if (!req.body.patientId) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Please provide patient id"));
    }
    const appointments = await Appointment.find({
      patientId: req.body.patientId,
    });
    if (!appointments) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Appointments not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Appointments retrieved successfully", appointments));
  } catch (err) {
    console.error(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Failed to retrieve appointments"));
  }
};

const getAppointmentByDoctorId = async (req, res) => {
  try {
    if (!req.body.doctorId) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Please provide doctor id"));
    }
    const appointments = await Appointment.find({
      doctorId: req.body.doctorId,
    });
    if (!appointments) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Appointments not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Appointments retrieved successfully", appointments));
  } catch (err) {
    console.error(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure(err.message));
  }
};

module.exports = {
  bookService,
  cancelService,
  getAllAppointments,
  getAppointmentById,
  getAppointmentByPatientId,
  getAppointmentByDoctorId,
};
