import express from 'express';
import cors from 'cors';

const authMiddleware = require('./middleware/auth');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const entryRoutes = require('./routes/entry.routes');
const archiveRoutes = require('./routes/archive.routes');
const reportsRoutes = require('./routes/reports.routes');
const inquiryRoutes = require('./routes/inquiry.routes');

const app = express();
app.use(cors());
app.use(express.json());

// 🔓 Auth
app.use('/api/auth', authRoutes);

// 🔐 Protected APIs
app.use(authMiddleware);
app.use('/api/users', usersRoutes);
app.use('/api/entry', entryRoutes);
app.use('/api/archive', archiveRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/inquiry', inquiryRoutes);

app.listen(3001, () => {
  console.log('🚀 Backend running on http://localhost:3001');
});