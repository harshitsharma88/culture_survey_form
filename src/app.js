const express = require("express");
const session = require("express-session");
const useragent = require("express-useragent");
const app = express();
const cors = require('cors');

const allowedOrigins = ['https://survey.cultureholidays.com', 'localhost', 'http://127.0.0.1:5500', 'https://cms.tripoculture.com/', 'https://devcms.cultureholidays.com'];

const corsOptions = {
  origin: allowedOrigins,
  methods: ['POST', 'GET', 'DELETE', 'PUT'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(useragent.express());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(require("path").join(__dirname, "..", "public")));

app.set('trust proxy', true);

app.set('view engine', 'ejs');
app.set('views',require("path").join(__dirname,"..","public", 'views'));

app.use(session({
  secret: process.env.sessionkey,
  resave: false,
  saveUninitialized: true,
  cookie: {
        httpOnly: true,
        secure: process.env.environment === 'production',
        maxAge: 86400000
    }
}));

const Routes = require("./routes/HomeRoute");

app.use("/", Routes);

module.exports = app;



