const verifySocketToken = require("./socketVerification");
const { addUser } = require("./socketOperations");

async function SocketMiddleware(socket, next) {
  console.log(socket.handshake.query.token,"Hello")
  const data = await verifySocketToken(socket.handshake.query.token);
  if (!data?.success) {
    return next(data); // Invalid token, reject the connection
  } else {
    addUser(socket, data.user);
    return next(); // socket.io next() callback function
  }
}

module.exports = SocketMiddleware;
