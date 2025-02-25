const express = require("express"),
  app = express(),
  dotenv = require("dotenv").config(),
  path = require("path"),
  cors = require("cors"),
  helmet = require("helmet"),
  hpp = require("hpp"),
  mongoSanitize = require("express-mongo-sanitize"),
  cookieParser = require("cookie-parser"),
  credentials = require("./middlewares/credentials"),
  corsOptions = require("./config/corsOption"),
  session = require("./loaders/express_session"),
  mongodb = require("./loaders/mongodb"),
  logger = require("morgan"),
  errorChecker = require("./middlewares/errorChecker"),
  ensureAuth = require("./middlewares/ensureAuth"),
  immutableFields = require("./middlewares/immutableFields"),
  { preValidator } = require("./middlewares/validator"),
  authRoutes = require("./routes/authRoutes"),
  settingsRoutes = require("./routes/settingsRoutes"),
  accountRoutes = require("./routes/accountRoutes"),
  mainRoutes = require("./routes/mainRoutes"),
  { passport_init, passport_session } = require("./loaders/passport"),
  localAuth = require("./services/localAuth"),
  verifyJWT = require("./middlewares/verifyJwt"),
  http = require("http"),
  server = http.createServer(app),
  mySocket = require("./services/socket.io/socketSetup"),
  port = process.env.PORT || 5000;

app.use(helmet());

app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://www.gstatic.com"],
      styleSrc: [
        "'self'",
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com",
      ],
      fontSrc: [
        "'self'",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com",
      ],
      imgSrc: [
        "'self'",
        "https:",
        "data:",
        "https://d3epktgu6t58eq.cloudfront.net",
      ],
      connectSrc: [
        "'self'",
        "https://d3epktgu6t58eq.cloudfront.net",
        "https://notebuzz.strrings.in",
        "wss://notebuzz.strrings.in",
      ],
      objectSrc: ["'none'"],
    },
  })
);
app.set("trust proxy", 1);
app.use(hpp());
app.disable("x-powered-by");
app.use(mongoSanitize());
app.use(credentials);
app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(session);
app.use(passport_init);
app.use(passport_session);
localAuth();
mongodb.connectToDatabase("NoteBuzz");
mySocket(server);
app.use(express.static(path.join(__dirname, "../public")));

app.use(errorChecker);
authRoutes.use(errorChecker);
accountRoutes.use(errorChecker);
settingsRoutes.use(errorChecker);
mainRoutes.use(errorChecker);

app.use(preValidator);
app.use(authRoutes);
app.use(immutableFields);
app.use(ensureAuth);
app.use(verifyJWT); /// set verify jwt for auth also
app.use(accountRoutes);
app.use(settingsRoutes);
app.use(mainRoutes);

app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

server.listen(port, (err) => {
  if (err) console.error(err);
  console.log("Server started successfully : " + port + " 🧠");
});
