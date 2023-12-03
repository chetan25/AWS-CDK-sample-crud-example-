import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// mocking a sdk module
jest.mock("@aws-sdk/client-dynamodb", () => {
  return {
    DynamoDBDocumentClient: jest.fn().mockImplementation(() => {
      return {
        send: jest.fn().mockImplementation(() => {
          return "Test";
        }),
      };
    }),
    ScanCommand: jest.fn(),
  };
});
