import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Device {
    _id: ID!
    name: String!
    type: String!
    status: String!
  }

  type TelemetryRecord {
    _id: ID!
    deviceId: String!
    timestamp: String!
    payload: String!
  }

  type Query {
    devices: [Device!]!
    device(id: ID!): Device
    deviceTelemetry(deviceId: String!): [TelemetryRecord!]!
  }

  type Subscription {
    telemetry(deviceId: String!): TelemetryRecord!
  }
`; 