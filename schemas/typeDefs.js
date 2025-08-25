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
    email: String!       # user’s email is the thread identifier
    from: String!        # "user" or "admin"
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

    # ✅ Get messages from a user to admin
    getMessagesFromUser(email: String!): [Message!]!

    # ✅ Get messages from admin to a user
    getMessagesFromAdmin(email: String!): [Message!]!

    # ✅ Get full conversation (both user + admin messages)
    getConversation(email: String!): [Message!]!
  }

  # ==========================
  # Mutations
  # ==========================
  type Mutation {
    # ✅ Auth
    register(name: String!, email: String!, password: String!): AuthPayload
    verifyOTP(email: String!, otp: String!): AuthPayload
    login(email: String!, password: String!): AuthPayload
    signOut: MessageResponse

    # ✅ Messaging
    sendMessage(email: String!, content: String!): Message!       # user -> admin
    sendAdminMessage(email: String!, content: String!): Message!  # admin -> user
  }
`;

module.exports = typeDefs;
