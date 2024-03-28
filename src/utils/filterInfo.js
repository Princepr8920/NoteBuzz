 
 function filterInfo(
    info,
    exclude = [
      "password",
      "_id",
      "confirmationCode",
      "userRequests",
      "verification",
      "tokens",
      "user_logs",
      "feedback",
      "provider",
      "__v"
    ]
  ) {
    function objFilter(infoObj, itemsToDelete = []) {
      for (let key in infoObj) {
        if (itemsToDelete.includes(key)) {
          delete infoObj[key];
        }
      }
      return infoObj;
    }

    if (Array.isArray(info)) {
      return info.map((e) => objFilter(e, exclude));
    }

    return objFilter(info, exclude);
  }

 module.exports = filterInfo