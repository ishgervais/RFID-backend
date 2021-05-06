const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const socketIo = require('socket.io');
const app = express();
const {loadAllCards} = require("./controller/index")

dotenv.config();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

require("./router")(app);
const mongoose = require("mongoose");

const server = http.createServer(app);

mongoose.Promise = global.Promise;

mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("\nDB Connected...");
    server.listen(process.env.PORT || 6600, () => {
      console.log(`Ctrl+Click to open: http://localhost:${process.env.PORT || 6600}\n`);
    });
  })
  .catch((err) => {
    console.log("Could not connect to the database. Exiting now...", err);
    process.exit();
  });






// socket io here because​
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});
let interval;
io.on("connection", (socket) => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 1000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

const getApiAndEmit = async (socket) => {
  let response = await loadAllCards();
  // Emitting a new message. Will be consumed by the client
  socket.emit("Cards", response || []);
};


//  socket io ends here

  
// define a simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to transactions" });
});
