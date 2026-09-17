require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./lib/prisma');
const { verifyToken } = require('./middleware/auth');
const errorHandler = require('./middleware/error');

const authRouter = require('./routes/auth');
const classroomsRouter = require('./routes/classrooms');
const subjectsRouter = require('./routes/subjects');
const questionsRouter = require('./routes/questions');
const quizzesRouter = require('./routes/quizzes');
const assignmentsRouter = require('./routes/assignments');
const attemptsRouter = require('./routes/attempts');
const analyticsRouter = require('./routes/analytics');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/classrooms', verifyToken, classroomsRouter);
app.use('/api/subjects', verifyToken, subjectsRouter);
app.use('/api/questions', verifyToken, questionsRouter);
app.use('/api/quizzes', verifyToken, quizzesRouter);
app.use('/api/assignments', verifyToken, assignmentsRouter);
app.use('/api/attempts', verifyToken, attemptsRouter);
app.use('/api/analytics', verifyToken, analyticsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
