const createUniqueIndex = require("../services/createUniqueIndex");

let USER_SCHEMA = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "User Object Validation",
      required: ["username", "password", "email", "last_visit", "joined_at"],
      additionalProperties: false,
      properties: {
        _id: { bsonType: "objectId" },
        username: {
          bsonType: "string",
          minLength: 3,
          description: "'username' must be a string and is required",
        },
        password: {
          bsonType: "string",
          description: "'password' must be a string and is required",
          minLength: 8,
        },
        email: {
          bsonType: "string",
          description: "'email' must be a string and is required",
        },
        avatar: { bsonType: "string" },
        userID: { bsonType: "string" },
        provider: { bsonType: "string" },
        last_visit: { bsonType: "date" },
        joined_at: { bsonType: "date" },

        appearance: {
          bsonType: "object",
          additionalProperties: false,
          properties: {
            dark_mode: {
              enum: ["on", "off", "auto", "system_default"],
              description: "Must be either on , off, system_default or auto",
            },
            grid_view: { bsonType: "bool" },
          },
        },
        security: {
          bsonType: "object",
          additionalProperties: false,
          properties: {
            two_step_verification: { bsonType: "bool" },
            login_notification: { bsonType: "bool" },
          },
        },

        confirmationCode: {
          bsonType: "object",
          additionalProperties: false,
          properties: {
            code: { bsonType: "string" },
            for: { bsonType: "string" },
            resend: { bsonType: "bool" },
            issueAt: { bsonType: "date" },
            count: { bsonType: "number" },
          },
        },

        userRequests: {
          bsonType: "object",
          additionalProperties: false,
          properties: {
            emailRequest: {
              bsonType: "object",
              additionalProperties: false,
              properties: {
                requestedEmail: { bsonType: "string" },
                issueAt: { bsonType: "date" },
              },
            },
          },
        },

        verification: { bsonType: "bool" },

        tokens: {
          bsonType: "object",
          additionalProperties: false,
          properties: {
            requestsToken: { bsonType: "string" },
            signupToken: { bsonType: "string" },
            loginToken: { bsonType: "string" },
            securityToken: { bsonType: "string" },
            refreshToken: { bsonType: "string" },
            socketToken: { bsonType: "string" },
            emailVerificationToken: { bsonType: "string" },
          },
        },
        user_logs: {
          bsonType: "object",
          additionalProperties: false,
          properties: {
            email_logs: {
              bsonType: "array",
              items: {
                bsonType: "object",
                additionalProperties: false,
                required: ["email", "update_count", "updated_on"],
                properties: {
                  email: { bsonType: "string" },
                  updated_on: { bsonType: "date" },
                  update_count: { bsonType: "int" },
                },
              },
            },
            username_logs: {
              bsonType: "array",
              items: {
                bsonType: "object",
                additionalProperties: false,
                required: ["username", "update_count", "updated_on"],
                properties: {
                  username: { bsonType: "string" },
                  updated_on: { bsonType: "date" },
                  update_count: { bsonType: "int" },
                },
              },
            },
            visit_logs: {
              bsonType: "object",
              additionalProperties: false,
              properties: {
                visit_counter: { bsonType: "int" },
                visits: {
                  bsonType: "array",
                  items: {
                    bsonType: "object",
                    additionalProperties: false,
                    properties: {
                      visit_count: { bsonType: "int" },
                      time_spent: { bsonType: "string" },
                      visited_on: { bsonType: "date" },
                    },
                  },
                },
              },
            },
          },
        },

        feedback: {
          bsonType: "array",
          items: {
            bsonType: "object",
            additionalProperties: false,
            properties: {
              message: { bsonType: "string" },
              receivedAt: { bsonType: "date" },
            },
          },
        },
      },
    },
  },
  validationLevel: "strict",
  validationAction: "error",
};

async function setDefaultValues(info, client) {
  const { email, username } = info;
  await createUniqueIndex(client, {
    selectedDb: "NoteBuzz",
    selectedCollection: "userCollection",
    uniqueness: { email: 1, username: 1, userID: 1 },
  });

  const objectWithDefaultValues = {
    ...info,
    provider: "local",
    avatar: `https://d3epktgu6t58eq.cloudfront.net/avatars/dog.png`,
    last_visit: new Date(),
    joined_at: new Date(),
    security: {
      two_step_verification: false,
      login_notification: false,
    },
    confirmationCode: {},
    verification: false,
    userID: "",
    userRequests: {},
    user_logs: {
      email_logs: [{ email: email, updated_on: new Date(), update_count: 0 }],
      username_logs: [
        { username: username, updated_on: new Date(), update_count: 0 },
      ],
      visit_logs: { visit_counter: 0, visits: [] },
    },
    appearance: {
      dark_mode: "off",
      grid_view: true,
    },
    feedback: [],
  };
  return objectWithDefaultValues;
}

module.exports = { setDefaultValues, USER_SCHEMA };
