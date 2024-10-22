const status = require("express-status-monitor");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

const databaseConnection = require("./config/database");
const UserRouter = require("./routes/user.route");
const AuthRouter = require("./routes/auth.route");
const ServiceRouter = require("./routes/service.route");
const AppointmentRouter = require("./routes/appointment.route");
const ChatRouter = require("./routes/chat.route");
const NoteRouter = require("./routes/note.route");
const PaymentRouter = require("./routes/payment.route");
const ReviewRouter = require("./routes/review.route");
const termsOfServiceRouter = require("./routes/termsOfService.route");
const faqRouter = require("./routes/faq.route");
const prescriptionRouter = require("./routes/prescription.route");

const app = express();

dotenv.config();

// const corsOptions = {
//     origin: "http://localhost:5173",
//     credentials: true,
// };

// app.use(cors(corsOptions));

app.use(cors({ origin: "*" }));

app.use(express.json()); // Parses data as JSON
app.use(express.text()); // Parses data as text
app.use(express.urlencoded({ extended: true })); // Parses data as urlencoded

// checks invalid json file
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).send({ message: "invalid json file" });
  }
  next();
});

const PORT = 3000;

// const accessLogStream = fs.createWriteStream(
//   path.join(__dirname, "/server/access.log"),
//   { flags: "a" }
// );

app.use(status());

// Use morgan with a combined format and stream it to the access log file
// app.use(morgan("combined", { stream: accessLogStream }));

app.use("/users", UserRouter);
app.use("/users", AuthRouter);
app.use("/service", ServiceRouter);
app.use("/appointment", AppointmentRouter);
app.use("/payment", PaymentRouter);
app.use("/note", NoteRouter);
app.use("/prescription", prescriptionRouter);
app.use("/chats", ChatRouter);
app.use("/review", ReviewRouter);
app.use("/terms-of-service", termsOfServiceRouter);
app.use("/faq", faqRouter);

// app.use()

// Route to handle all other invalid requests
app.use((req, res) => {
  return res.status(400).send({ message: "Route doesnt exist" });
});

databaseConnection(() => {
  app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
  });
});
