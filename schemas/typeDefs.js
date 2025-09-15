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
    archived: Boolean
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
  # Booking Type
  # ==========================
  type Booking {
    id: ID!
    userId: ID!
    name: String!
    phone: String!
    email: String!
    room: String!
    date: String!
    time: String!
    duration: String!
    notes: String
    paymentMethod: String!
    sessionType: String!
    createdAt: String!
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
    getAllChats: [User!]!
    getArchivedChats: [User!]!
    getMessages(chatId: String!): [Message!]!
    getUserBookings(userId: ID!): [Booking!]!  # Admin only
  }

  # ==========================
  # Mutations
  # ==========================
  type Mutation {
    register(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    signOut: MessageResponse!
    sendMessage(chatId: String!, from: String!, type: String!, content: String!): Message!
    archiveChat(chatId: String!): MessageResponse!
    unarchiveChat(chatId: String!): MessageResponse!

    # ✅ Create booking (logged-in user) — no userId argument
    createBooking(
      name: String!
      phone: String!
      email: String!
      room: String!
      date: String!
      time: String!
      duration: String!
      notes: String
      paymentMethod: String!
      sessionType: String!
    ): Booking!
  }
`;

module.exports = typeDefs;
