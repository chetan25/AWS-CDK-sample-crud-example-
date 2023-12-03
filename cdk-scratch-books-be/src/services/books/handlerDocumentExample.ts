import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResultV2,
  Context,
} from "aws-lambda";
import { v4 } from "uuid";

const dbClient = new DynamoDBClient({});

async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResultV2> {
  let message;
  let response;

  try {
    switch (event.httpMethod) {
      case "GET":
        response = await getHandler(event, dbClient);
        break;
      case "POST":
        response = await postHandler(event, dbClient);
        break;
      default:
        message = "Hello";
        break;
    }

    return response;
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error.message),
    };
  }
}

async function postHandler(
  event: APIGatewayProxyEvent,
  dbClient: DynamoDBClient
): Promise<APIGatewayProxyResultV2> {
  // wrapping with documentClient
  const dbDocClient = DynamoDBDocumentClient.from(dbClient);
  const randomId = v4();
  // add validation
  const item = JSON.parse(event.body);

  // we can use marshal if we want to omit the dataTypes
  const result = await dbDocClient.send(
    new PutItemCommand({
      TableName: process.env.TABLE_NAME,
      Item: item,
    })
  );

  console.log(result);

  return {
    statusCode: 201,
    body: JSON.stringify({
      id: randomId,
    }),
  };
}

async function getHandler(
  event: APIGatewayProxyEvent,
  dbClient: DynamoDBClient
): Promise<APIGatewayProxyResultV2> {
  // wrapping with documentClient
  const dbDocClient = DynamoDBDocumentClient.from(dbClient);

  if (event.queryStringParameters) {
    if ("id" in event.queryStringParameters) {
      const { id } = event.queryStringParameters;

      const getItemResponse = await dbDocClient.send(
        new GetCommand({
          TableName: process.env.TABLE_NAME,
          Key: {
            id: id,
          },
        })
      );

      if (getItemResponse.Item) {
        return {
          statusCode: 200,
          body: JSON.stringify(getItemResponse.Item),
        };
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify("Id not found !!!"),
        };
      }
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify("Id required"),
      };
    }
  }
  const result = await dbDocClient.send(
    new ScanCommand({
      TableName: process.env.TABLE_NAME,
    })
  );
  // result will be marshlled, with data types
  console.log(result.Items);

  return {
    statusCode: 201,
    body: JSON.stringify(result.Items),
  };
}

export { handler };
