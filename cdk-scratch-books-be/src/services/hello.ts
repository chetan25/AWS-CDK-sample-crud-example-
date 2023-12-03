import {
  APIGatewayProxyEvent,
  APIGatewayProxyResultV2,
  Context,
} from "aws-lambda";
import { v4 } from "uuid";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

// initialize client
const s3 = new S3Client({});

async function handler(event: APIGatewayProxyEvent, context: Context) {
  const command = new ListBucketsCommand({});
  const listBucketResult = (await s3.send(command)).Buckets;

  const response: APIGatewayProxyResultV2 = {
    statusCode: 200,
    body: JSON.stringify(
      `Hello from Lambda ${v4} - Buckets are ${listBucketResult}`
    ),
  };

  return response;
}

export { handler };
