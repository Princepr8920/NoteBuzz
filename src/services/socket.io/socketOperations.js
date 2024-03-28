const users = {},
  usersInfo = {};

const addUser = (socket, user) => {
  users[socket.id] = user.userID; // To save userID in object for socket operation with socket key
  usersInfo[user.userID] = user;
  /* User object to get necessary data of
     current user data we can use it in differents condition, it will work like req.user*/
};

const removeUser = (userID) => {
  delete users[userID];
  delete usersInfo[userID];
};

const getUserID = (socketID) => users[socketID];

const getUserInfo = (userID) => usersInfo[userID];

module.exports = { addUser, removeUser, getUserID, getUserInfo };
