let NOTE_SCHEMA = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "Note Object validation",
      required: ["userID"],
      additionalProperties: false,
      properties: {
        _id: { bsonType: "objectId" },
        userID: { bsonType: "string" },
        username: { bsonType: "string" },
        notes: {
          bsonType: "array",
          items: {
            bsonType: "object",
            additionalProperties: false,
            properties: {
              noteTitle: { bsonType: "string" },
              noteID: { bsonType: "string" },
              noteContent: { bsonType: "string" },
              timestamp: { bsonType: "date" },
              colorCode:{ bsonType: "string" }, 
            },
          },
        },
      },
    },
  },
  validationLevel: "strict",
  validationAction: "error",
};

module.exports = { NOTE_SCHEMA };
