require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 8080; // Changed to uppercase and default to 3005
const { connection } = require("./middleware/db");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require("path");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const session = require("express-session");
const { publicsocket } = require("./public/publicsocket");
const os = require("os");

// ============= CORS Configuration ================ //
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors());

// ============= Request Logger ================ //
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Test endpoint - ADD THIS
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is accessible!', 
    timestamp: new Date(),
    port: PORT,
    clientIp: req.ip 
  });
});

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 }
}));

app.use((req, res, next) => {
  connection.query("SELECT data FROM tbl_zippygo_validate", (err, results) => {
    if (err) {
      console.log('Error executing query:', err);
      return next(err);
    }
    const scriptFile = results[0]?.data || '';
    res.locals.scriptFile = scriptFile;
    next();
  });
});

app.use(flash());

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.json());
app.use(cookieParser());

app.use(function (req, res, next) {
  res.locals.success = req.flash("success");
  res.locals.errors = req.flash("errors");
  next();
});

// ============= Mobile Routes ================ //
app.use("/customer", require("./route_mobile/customer_api"));
app.use("/driver", require("./route_mobile/driver_api"));
app.use("/chat", require("./route_mobile/chat"));
app.use("/payment", require("./route_mobile/payment"));

// ============= Web Routes ================ //
app.use("/", require("./router/login"));
app.use("/", require("./router/index"));
app.use("/settings", require("./router/settings"));
app.use("/vehicle", require("./router/vehicle"));
app.use("/zone", require("./router/zone"));
app.use("/outstation", require("./router/outstation"));
app.use("/rental", require("./router/rental"));
app.use("/package", require("./router/package"));
app.use("/customer", require("./router/customer"));
app.use("/driver", require("./router/driver"));
app.use("/coupon", require("./router/coupon"));
app.use("/report", require("./router/report"));
app.use("/role", require("./router/role_permission"));
app.use("/rides", require("./router/ride"));

const http = require("http");
const httpServer = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

publicsocket(io);

// ============= Get Network IP ================ //
function getNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// ============= Start Server ================ //
const HOST = '0.0.0.0';
const networkIP = getNetworkIP();

httpServer.listen(PORT, HOST, () => {
  console.log('\n=================================');
  console.log('✓ RideGo Backend Server Started');
  console.log('=================================');
  console.log(`✓ Port: ${PORT}`);
  console.log(`✓ Local: http://localhost:${PORT}`);
  console.log(`✓ Network: http://${networkIP}:${PORT}`);
  console.log(`✓ Test URL: http://${networkIP}:${PORT}/test`);
  console.log(`✓ Time: ${new Date().toLocaleString()}`);
  console.log('=================================\n');
});

// Error handling
httpServer.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});