'use strict';
require('dotenv').config();
const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');
const helmet      = require('helmet')
const mongoose    = require('mongoose')

const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(helmet({
  frameguard: { action: 'sameorigin' },
  dnsPrefetchControl: { allow: false },
  referrerPolicy: { policy: ['same-origin'] }
}))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Sample front-end
app.route('/b/:board/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/board.html');
  });
app.route('/b/:board/:threadid')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/thread.html');
  });

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

// Connect to database
mongoose.connect(process.env.DB, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false
})

const connection = mongoose.connection
connection.on('error', console.error.bind(console, 'connection error'))
connection.once('open', () => console.log('MongoDB database connection established successfully'))

// Create schema
const Schema = mongoose.Schema
const replySchema = Schema({
  text: {type: String, required: true},
  delete_password: {type: String, required: true},
  thread_id: {type: Schema.Types.ObjectId, required: true, ref: 'Thread'},
  reported: {type: Boolean, required: true, default: false},
  created_on: {type: Date, required: true, default: Date.now},
})
const threadSchema = Schema({
  board: {type: String, required: true},
  text: {type: String, required: true},
  created_on: {type: Date, required: true, default: Date.now},
  bumped_on: {type: Date, required: true, default: Date.now},
  reported: {type: Boolean, required: true, default: false},
  delete_password: {type: String, required: true},
  replies: [{
    type: Schema.Types.ObjectId,
    ref: 'Reply'
  }]
})
const Reply = mongoose.model('Reply', replySchema)
const Thread = mongoose.model('Thread', threadSchema)

//Routing for API 
apiRoutes(app, Thread, Reply);

//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + process.env.PORT);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        var error = e;
          console.log('Tests are not valid:');
          console.log(error);
      }
    }, 1500);
  }
});

module.exports = app; //for testing
