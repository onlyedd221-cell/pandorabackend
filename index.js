require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
// const { graphqlUploadExpress } = require('graphql-upload');
const connectDB = require('./data/database');
const userSchema = require('./schemas/typeDefs');
const userResolvers = require('./resolvers/userResolvers');
const authMiddleware = require('./middleware/authMiddleware');
const cors = require('cors');

const app = express();

// ✅ Correct list of allowed origins (no trailing slash, no /graphql)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:10000',
  'https://studio.apollographql.com',
  'https://pandoragoddessclubhouse.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// app.use(graphqlUploadExpress());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

connectDB();

// Add this route to handle GET /
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

const server = new ApolloServer({
  typeDefs: userSchema,
  resolvers: userResolvers,
  context: ({ req }) => ({ user: authMiddleware(req) }),
  introspection: true,
  playground: true
});

const startServer = async () => {
  await server.start();
  server.applyMiddleware({ app, cors: false });

  const PORT = process.env.PORT || 10000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}${server.graphqlPath}`);
  });
};

startServer();

module.exports = app;
