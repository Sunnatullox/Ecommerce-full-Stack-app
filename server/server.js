const {app,io} = require("./app");
const connectDb = require("./config/db");



// Handling uncaught Exception
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`shutting down the server for handling uncaught exception`);
  });

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config();
  }

// connect db
connectDb();


// create server
const PORT = process.env.PORT || 5500;
const server = app.listen(PORT, () => {
    console.log("Server is running on http://localhost:" + PORT);
});


// Connect Socket.io to the existing HTTP server
io.attach(server);

// unhandled promise rejection
process.on("unhandledRejection", (err) => {
    console.log(`Shutting down the server for ${err.message}`);
    console.log(`shutting down the server for unhandle promise rejection`);
  
    server.close(() => {
      process.exit(1);
    });
  });
  