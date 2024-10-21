const Appointment = require("../model/appointment.model");
const Service = require("../model/service.model");
const User = require("../model/user.model");
const Notification = require("../model/notification.model");
const { emailWithNodemailerGmail } = require("../config/email.config");
const { success, failure } = require("../utilities/common");
const HTTP_STATUS = require("../constants/statusCodes");

// Book an appointment
const bookAppointment = async (req, res) => {
  try {
    const { serviceId, dateTime, dayOfWeek, type } = req.body;

    if (!req.user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("User not logged in"));
    }

    const patientId = req.user._id;

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

    // const doctor = await User.findById(service.doctor);
    // if (!doctor) {
    //   return res
    //     .status(HTTP_STATUS.NOT_FOUND)
    //     .send(failure("Doctor not found"));
    // }

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
      // doctorId: service.doctor || ,
      dateTime: new Date(dateTime),
      dayOfWeek,
      type,
    });

    // if (appointment) {
    //   // Remove the selected dateTime from the service's available times
    //   service.dateTimes = service.dateTimes.filter(
    //     (time) => new Date(time).getTime() !== selectedDateTime
    //   );
    //   await service.save();
    // }

    await appointment.save();

    // Create a notification for the doctor
    const notification = new Notification({
      applicant: patientId,
      // admin: service.doctor,
      serviceId,
      type: "serviceApplication",
      message: `A new appointment has been created for service ${service.division}`,
    });
    await notification.save();

    // doctor.notifications.push(notification._id);
    // await doctor.save();

    patient.consultationUpcoming.push(appointment._id);
    patient.notifications.push(notification._id);
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
// Cancel an appointment
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId, patientId } = req.body;

    // Find the appointment
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: patientId,
      status: "upcoming",
    }).populate("serviceId");

    if (!appointment) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Appointment not found or already cancelled"));
    }

    // Cancel the appointment
    appointment.status = "cancelled";
    await appointment.save();

    const patient = await User.findById(patientId);

    // Remove the appointment from the patient's upcoming appointments and put it into the consultation history
    patient.consultationHistory.push(appointment._id);
    patient.consultationUpcoming = patient.consultationUpcoming.filter(
      (id) => id.toString() !== appointment._id.toString()
    );
    await patient.save();

    // Create a notification for the patient
    const notification = new Notification({
      applicant: patientId,
      admin: appointment.doctorId,
      serviceId: appointment.serviceId,
      type: "serviceApplication",
      message: `Your appointment has been cancelled for service ${appointment.serviceId.division}`,
    });

    if (notification) {
      patient.notifications.push(notification._id);
      await patient.save();
    }

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

const addZoomLinkToAppointment = async (req, res) => {
  try {
    const { appointmentId, zoomLink, email } = req.body;

    // Find the appointment
    const appointment = await Appointment.findOne({
      _id: appointmentId,
    });

    if (!appointment) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Appointment not found"));
    }

    // Add the zoom link to the appointment
    appointment.zoomLink = zoomLink;
    appointment.patientEmail = email;
    await appointment.save();
    const dateTime = new Date(appointment.dateTime).toLocaleString();
    const emailData = {
      email: email,
      subject: "Appointment zoom link",
      html: ` <h2 style="color: #007BFF; text-align: center;">Zoom Link to your appointment</h2>
              <h4>Hello there,</h4>
              <p>The zoom link to your appointment is: <a href="${zoomLink}">${zoomLink}</a></p>
              <p style="padding: 8px 0;"><strong >Appointment Date & Time: </strong> ${dateTime}</p>
              <p style="color: #555;">Please be present 10 minutes prior to the scheduled appointment time.</p>
              <p>Best regards,</p>
              <p><strong>My Doctor Clinic</strong></p>
            `,
    };

    emailWithNodemailerGmail(emailData);

    return res
      .status(HTTP_STATUS.OK)
      .send(success("Zoom link added successfully", { appointment }));
  } catch (err) {
    console.error(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Failed to add zoom link"));
  }
};

const completeAppointment = async (req, res) => {
  try {
    const { appointmentId, patientId } = req.body;

    // Find the appointment
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: patientId,
    });

    if (!appointment) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Appointment not found"));
    }

    // Complete the appointment
    appointment.status = "completed";
    await appointment.save();

    return res
      .status(HTTP_STATUS.OK)
      .send(success("Appointment successfully completed", { appointment }));
  } catch (err) {
    console.error(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Failed to complete the appointment"));
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
  bookAppointment,
  cancelAppointment,
  addZoomLinkToAppointment,
  completeAppointment,
  getAllAppointments,
  getAppointmentById,
  getAppointmentByPatientId,
  getAppointmentByDoctorId,
};
