const { gql } = require("apollo-server-express");

const typeDefs = gql`
  # ==========================
  # User Type
  # ==========================
  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: String
    updatedAt: String
  }

  # ==========================
  # Message Type
  # ==========================
  type Message {
    id: ID!
    chatId: String!
    from: String!   # "user" or "admin"
    type: String!   # "text" or "image"
    content: String!
    timestamp: String!
  }

  # ==========================
  # Auth Payload
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
    message: String!
  }

  # ==========================
  # Queries
  # ==========================
  type Query {
    # Get all chats (admin only)
    getAllChats: [User!]!

    # Get messages for a specific chat
    getMessages(chatId: String!): [Message!]!
  }

  # ==========================
  # Mutations
  # ==========================
  type Mutation {
    # Register a new user
    register(name: String!, email: String!, password: String!): AuthPayload!

   

    # Login
    login(email: String!, password: String!): AuthPayload!

    # Sign out
    signOut: MessageResponse!

    # Send a message
    sendMessage(chatId: String!, from: String!, type: String!, content: String!): Message!
  }
`;

module.exports = typeDefs;
