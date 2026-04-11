import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

import userRoute from './route/user.route.js';
import dashboardRoute from './route/dashboard.route.js';
import aiRoute from './route/ai.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1402;
const URI = process.env.MongoDBURI;
const JWT_SECRET = process.env.JWT_SECRET;

let cachedConnection = global.mongooseConnection;
let cachedConnectionPromise = global.mongooseConnectionPromise;

app.use(express.json());

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_ORIGIN,
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
};

async function connectToDatabase() {
  if (!URI) {
    throw new Error('Missing MongoDBURI environment variable');
  }

  if (!JWT_SECRET) {
    throw new Error('Missing JWT_SECRET environment variable');
  }

  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  if (!cachedConnectionPromise) {
    cachedConnectionPromise = mongoose.connect(URI, {
      bufferCommands: false,
    });
    global.mongooseConnectionPromise = cachedConnectionPromise;
  }

  cachedConnection = await cachedConnectionPromise;
  global.mongooseConnection = cachedConnection;

  return cachedConnection;
}

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(async (_req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database bootstrap error:', error.message);
    return res.status(500).json({
      message: 'Server configuration error',
      detail: error.message,
    });
  }
});

app.use('/user', userRoute);
app.use('/dashboard', dashboardRoute);
app.use('/ai', aiRoute);

app.get('/', (_req, res) => {
  res.json({ success: true, message: 'server up and running' });
});

if (process.env.VERCEL !== '1') {
  connectToDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('Startup error:', error.message);
      process.exit(1);
    });
}

export default app;
