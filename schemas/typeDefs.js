const { gql } = require('apollo-server-express');

const typeDefs = gql`
  # ==========================
  # User Type
  # ==========================
  type User {
    id: ID!
    name: String!
    email: String!
    otp: String
    otpVerified: Boolean
    createdAt: String
    updatedAt: String
  }

  # ==========================
  # Message Type
  # ==========================
  type Message {
    id: ID!
    sessionId: String!
    from: String!
    email: String
    content: String!
    createdAt: String!
  }

  # ==========================
  # Auth Payload (for login/register/verifyOTP)
  # ==========================
  type AuthPayload {
    token: String
    user: User
    message: String
  }

  # ==========================
  # Generic Response
  # ==========================
  type MessageResponse {
    message: String
  }

  # ==========================
  # Queries
  # ==========================
  type Query {
    _empty: String
    getMessages(sessionId: String!): [Message!]!
  }

  # ==========================
  # Mutations
  # ==========================
  type Mutation {
    register(name: String!, email: String!, password: String!): AuthPayload
    verifyOTP(email: String!, otp: String!): AuthPayload
    login(email: String!, password: String!): AuthPayload
    signOut: MessageResponse
    sendMessage(sessionId: String!, email: String!, content: String!): Message!
  }
`;

module.exports = typeDefs;
