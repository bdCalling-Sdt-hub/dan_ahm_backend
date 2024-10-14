const express = require("express");
const routes = express();
const {
  createPaymentIntent,
  getPaymentIntent,
  getAllPaymentIntents,
} = require("../controller/payment.controller");

routes.post("/create-payment-intent", createPaymentIntent);
routes.post("/get-payment-intent", getPaymentIntent);
routes.get("/get-all-payment-intents", getAllPaymentIntents);

module.exports = routes;
