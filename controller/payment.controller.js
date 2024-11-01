const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Appointment = require("../model/appointment.model");
const Service = require("../model/service.model");
const Transaction = require("../model/transaction.model");
const HTTP_STATUS = require("../constants/statusCodes");
const { success, failure } = require("../utilities/common");
const { emailWithNodemailerGmail } = require("../config/email.config");

const createPaymentIntent = async (req, res) => {
  try {
    const { appointmentId, paymentMethodId, amount } = req.body;

    if (!appointmentId || !paymentMethodId || !amount) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("please provide all the fields"));
    }

    // Fetch the appointment details
    const appointment = await Appointment.findById(appointmentId).populate(
      "patientId"
    );

    if (!appointment) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Appointment not found"));
    }

    // Create a payment intent
    let paymentIntent;

    paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // amount in cents
      currency: "usd", // or your preferred currency
      payment_method: paymentMethodId,
      confirm: false, // Do not confirm automatically
    });

    if (!paymentIntent) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Payment failed"));
    }

    return res
      .status(HTTP_STATUS.OK)
      .send(success("Payment processed successfully", paymentIntent));
  } catch (err) {
    console.error(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Payment failed", err.message));
  }
};

const confirmPaymentbyPaymentIntent = async (req, res) => {
  try {
    const { paymentIntent, appointmentId } = req.body;

    console.log("paymentIntent", paymentIntent);
    console.log("appointmentId", appointmentId);

    if (!paymentIntent || !appointmentId) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("please provide paymentIntent and appointmentId"));
    }

    const appointment = await Appointment.findById(appointmentId).populate(
      "patientId serviceId"
    );

    console.log("appointment", appointment);

    if (!appointment) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Appointment not found"));
    }

    // Update the appointment with payment status
    appointment.paymentStatus = "paid";
    appointment.paymentId = paymentIntent.id;
    await appointment.save();

    // Create a new transaction
    const transaction = new Transaction({
      user: appointment.patientId,
      appointment: appointment._id,
      paymentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      status: "paid",
    });
    await transaction.save();

    console.log("paymentIntent", paymentIntent.amount);

    console.log("transaction", transaction);

    const service = await Service.findById(appointment.serviceId);
    const selectedDateTime = new Date(appointment.dateTime).getTime();

    if (service) {
      // Remove the selected dateTime from the service's available times
      service.dateTimes = service.dateTimes.filter(
        (time) => new Date(time).getTime() !== selectedDateTime
      );
      await service.save();
    }

    const patientName = appointment.patientId.name || "patient";
    const dateTime = new Date(appointment.dateTime).toLocaleString();
    const emailData = {
      email: appointment.patientId.email,
      subject: "Payment processed successfully",
      html: `
              <h2 style="color: #007BFF; text-align: center;">Appointment Confirmed</h2>
              <p>Dear <strong>${patientName}</strong>,</p>
              <p>Your appointment has been successfully booked</p>
              <p style="padding: 8px 0;"><strong >Appointment Date & Time: </strong> ${dateTime}</p>
              <p>You will recieve a zoom link soon!</p>
              <p>Best regards,</p>
              <p><strong>My Doctor Clinic</strong></p>
            `,
    };

    emailWithNodemailerGmail(emailData);

    return res
      .status(HTTP_STATUS.OK)
      .send(success("Payment confirmed successfully", paymentIntent));
  } catch (err) {
    console.error(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Payment failed", err.message));
  }
};

const getPaymentIntent = async (req, res) => {
  try {
    const { paymentId } = req.body;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
    // console.log("paymentIntent", paymentIntent.status);
    if (!paymentIntent) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Payment not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Payment retrieved successfully", paymentIntent));
  } catch (err) {
    console.error(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Payment failed", err.message));
  }
};

const getAllPaymentIntents = async (req, res) => {
  try {
    const paymentIntents = await stripe.paymentIntents.list();
    if (!paymentIntents) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("Payment intents not found"));
    }
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Payment intents retrieved successfully", paymentIntents));
  } catch (err) {
    console.error(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Payment intents failed", err.message));
  }
};

module.exports = {
  createPaymentIntent,
  getPaymentIntent,
  getAllPaymentIntents,
  confirmPaymentbyPaymentIntent,
};
