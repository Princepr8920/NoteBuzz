const { MongoClient } = require("mongodb"),
  uri = process.env.MONGO_DB_URL,
  client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
  }),
  { USER_SCHEMA } = require("../models/userSchema"),
  { NOTE_SCHEMA } = require("../models/notesSchema"),
  connection = { isConnected: false };

async function connectToDatabase() {
  console.log(process.env.MONGO_DB_URL)
  try {
    await client.connect();
    console.log("Database connected successfully 💽");
    connection.isConnected = true;
    const appCollections = [
      createCollectionWithSchema({
        collection: "userCollection",
        schema: USER_SCHEMA,
      }),
      createCollectionWithSchema({
        collection: "notesCollection",
        schema: NOTE_SCHEMA,
      }),
      createCollectionWithSchema({
        collection: "testCollection",
        schema: USER_SCHEMA,
      }),
    ];

    Promise.all(appCollections)
      .then((responses) => responses)
      .catch((error) => {
        console.error(error);
      });

    addNewProperty({
      collection: "userCollection", //enter collection name to update schema
      modelObject: USER_SCHEMA, // enter schema to update
      modify: false, // change to true if we need to update schema
    });
  } catch (err) {
    connection.isConnected = false;
    console.error(err);
  }
}

async function createCollectionWithSchema(options) {
  let { collection, schema } = options;
  try {
    if (connection.isConnected) {
      if (schema && collection) {
        const collections = await client
            .db("NoteBuzz")
            .listCollections()
            .toArray(),
          exisitingCollections = collections.map((e) => e.name);
        if (!exisitingCollections.includes(collection)) {
          // If db collection with schema are not created so this will create it🔌
          await client.db("NoteBuzz").createCollection(collection, schema);
        }
      }
      return { collection, created: true };
    } else {
      throw new Error("Database not connected ❌");
    }
  } catch (error) {
    console.error(error);
  }
}

async function addNewProperty(options) {
  const { collection, modelObject, modify } = options;
  if (modify) {
    const DB = client.db("NoteBuzz");
    DB.command(
      {
        collMod: collection,
        ...modelObject,
      },
      function (err, result) {
        if (err) throw err;
        return { ...result, isModified: true };
      }
    );
  }
  return { isModified: false };
}

function database(collection = "userCollection") {
  const db = client.db("NoteBuzz").collection(collection);
  return db;
}

async function disconnectToDatabase() {
  await client.close();
  console.log("Database disconnected 🚫");
  return;
}

module.exports = {
  connectToDatabase,
  client,
  database,
  createCollectionWithSchema,
  disconnectToDatabase,
};
