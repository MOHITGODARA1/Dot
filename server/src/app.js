const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const env = require('./config/env');
const { generalLimiter } = require('./middleware/rateLimit');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

// Behind a load balancer, trust its forwarded IP so rate limits see the real client.
if (env.trustProxy) app.set('trust proxy', 1);

app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(',').map((o) => o.trim()),
  })
);
app.use(express.json({ limit: '10kb' })); // auth requests are tiny; reject anything large
app.use(generalLimiter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler); // must be last

module.exports = app;
