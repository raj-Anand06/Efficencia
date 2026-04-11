
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

import userRoute from './route/user.route.js';
import dashboardRoute from './route/dashboard.route.js';
import aiRoute from './route/ai.route.js';

dotenv.config();

const app = express();

// Parse JSON
app.use(express.json());

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_ORIGIN,   // e.g. https://efficencia.vercel.app
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // allow REST tools / server-to-server (no Origin) and allowed origins
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

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));


const PORT = process.env.PORT || 1402;
const URI = process.env.MongoDBURI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!URI) {
  console.error('❌ Missing MongoDBURI in .env');
  process.exit(1);
}

if (!JWT_SECRET) {
  console.error('Missing JWT_SECRET in .env');
  process.exit(1);
}

mongoose
  .connect(URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ Error connecting to MongoDB:', err);
    process.exit(1);
  });

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/user', userRoute);
app.use('/dashboard', dashboardRoute);
app.use('/ai', aiRoute);


app.get('/', (_req, res) => {
  res.json({ success: true, message: 'server up and running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
