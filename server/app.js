const express = require("express");
const ErrorHandler = require("./middleware/error");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const cron = require("node-cron");
const compression = require("compression");
const fileUpload = require("express-fileupload");
const socketIO = require("socket.io");
const http = require("http");
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

// socket
app.set("io", io);

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config();
}

app.use(
  cors({
    origin: [process.env.CLIENT_URL],
    credentials: true,
  })
  );

  app.use(fileUpload());
  app.use(morgan("dev"));
  app.use(compression());
  app.use(express.json());
  app.use(cookieParser());
  
  app.use("/test", (req, res) => {
    res.send("Hello world!");
  });
  
  app.use(bodyParser.urlencoded({ extended: true }));
  
  // import routes
  const userRoute = require("./routes/userRoute");
  const shopRoute = require("./routes/shopRoute");
  const productRoute = require("./routes/productRoute");
  const eventRoute = require("./routes/eventRoute");
  const coupoun = require("./routes/couponCodeRoute");
  const order = require("./routes/orderRoute");
  const messages = require("./routes/messagesRoute");
  const conversation = require("./routes/conversationRoute");
  const payment = require("./routes/paymentRoute");
  const withdraw = require("./routes/withdrawRoute");
  const { getImageUrl } = require("./utils/firebase");
  
app.use("/api/user", userRoute);
app.use("/api/seller", shopRoute);
app.use("/api/product", productRoute);
app.use("/api/event", eventRoute);
app.use("/api/coupon", coupoun);
app.use("/api/order", order);
app.use("/api/message", messages);
app.use("/api/conversation", conversation);
app.use("/api/payment", payment);
app.use("/api/withdraw", withdraw);

// handler error
app.use(ErrorHandler);
// Redis ma'lumotlarni saqlash uchun qo'shimcha funksiyalar
const users = [];

// ...
// Remove the Redis initialization: const redis = new Redis();

// Replace Redis functions with in-memory operations

// Add a user to the in-memory array
const addUserToMemory = (userId, socketId) => {
  const existingUserIndex = users.findIndex(
    (user) => user.socketId === socketId
  );
  if (existingUserIndex === -1) {
    users.push({ userId, socketId });
  }
};

// Get a user's ID from the in-memory array
const getUserFromMemory = (socketId) => {
  const user = users.find((u) => u.socketId === socketId);
  return user ? user.userId : null;
};

// Get all users from the in-memory array
const getAllUsersFromMemory = () => {
  return users;
};

// Add or update a user in the in-memory array
const addUser = (userId, socketId) => {
  addUserToMemory(userId, socketId);
  return getAllUsersFromMemory();
};

// Remove a user from the in-memory array
const removeUser = (socketId) => {
  const userIndex = users.findIndex((user) => user.socketId === socketId);
  if (userIndex !== -1) {
    users.splice(userIndex, 1);
  }
};

let userMessages = [];

io.on("connection", async (socket) => {

  // when connect
  console.log(`a user is connected`);
  const users = getAllUsersFromMemory();

  // take userId and socketId from user
  socket.on("addUser", async (userId) => {
    const newUser = addUser(userId, socket.id);
    io.emit("getUsers", newUser);
  });

  // send and get message
  socket.on("sendMessage", async ({ sender, receiverId, text, image }) => {
    const receiverUser = users.find((user) => user.userId === receiverId);

    if (!image) {
      const message = {
        conversationId: receiverId,
        sender: sender,
        text: text,
      };

      // If the user is not online, store the message in userMessages
      if (!receiverUser) {
        userMessages.push(message);
      } else {
        io.to(receiverUser.socketId).emit("newMessage", message);
      }
    } else {
      setTimeout(async () => {
        const fileUrl = await getImageUrl(image);
        const message = {
          conversationId: receiverId,
          sender: sender,
          text: text,
          images: fileUrl,
        };

        // If the user is not online, store the message in userMessages
        if (!receiverUser) {
          userMessages.push(message);
        } else {
          io.to(receiverUser.socketId).emit("newMessage", message);
        }
      }, 1000);
    }
  });
  
  cron.schedule("*/0.5 * * * * *", () => {
    try {
      if (userMessages.length > 0) {
        for (const { userId, socketId } of users) {
          const userSpecificMessages = userMessages.filter(
            (message) => message.conversationId === userId
          );
  
          if (userSpecificMessages.length > 0) {
            for (const message of userSpecificMessages) {
              console.log(message);
              io.to(socketId).emit("newMessage", message);
            }
            userMessages = userMessages.filter(
              (message) => message.conversationId !== userId
            );
          }
        }
      }
    } catch (error) {
      console.error("Error in cron:", error);
    }
  });
  
  socket.on("disconnect", async () => {
    console.log(`a user disconnected!`);
    removeUser(socket.id);
    io.emit("getUsers", getAllUsersFromMemory());
  });
});


module.exports = { app, io };
