import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall, marshall } from "@aws-sdk/util-dynamodb";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { v4 } from "uuid";
import {
  JsonParseError,
  RequiredFieldError,
  hasAdminGroup,
  parseJson,
  validator,
} from "../utils";

function addcorsHeader(arg: APIGatewayProxyResult) {
  if (!arg.headers) {
    arg.headers = {};
  }
  arg.headers["Access-Control-Allow-Origin"] = "*";
  arg.headers["Access-Control-Allow-Methods"] = "*";
}

const dbClient = new DynamoDBClient({});

async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  console.log(event);
  console.log(context);
  //event ==> requestContext.authorizer.claims.email or cognito:username

  let message;
  let response: APIGatewayProxyResult;

  try {
    switch (event.httpMethod) {
      case "GET":
        response = await getHandler(event, dbClient);
        break;
      case "POST":
        response = await postHandler(event, dbClient);
        break;
      case "PUT":
        response = await putHandler(event, dbClient);
        break;
      default:
        message = "Hello";
        break;
    }

    addcorsHeader(response);
    return response;
  } catch (error) {
    if (
      error instanceof RequiredFieldError ||
      error instanceof JsonParseError
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify(error.message),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify(error.message),
    };
  }
}

async function postHandler(
  event: APIGatewayProxyEvent,
  dbClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  //event ==> requestContext.authorizer.claims.email or cognito:username
  const userName = event.requestContext.authorizer?.claims["cognito:username"];
  const randomId = v4();
  const item = parseJson(event.body);
  item.id = randomId;
  item.userName = userName;

  validator(item);

  // we can use marshal if we want to omit the dataTypes
  const result = await dbClient.send(
    new PutItemCommand({
      TableName: process.env.TABLE_NAME,
      // Item: {
      //   id: {
      //     S: randomId,
      //   },
      //   author: {
      //     S: item.location,
      //   },
      // },
      Item: marshall(item),
    })
  );

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
): Promise<APIGatewayProxyResult> {
  //event ==> requestContext.authorizer.claims.email or cognito:username
  const userName = event.requestContext.authorizer?.claims["cognito:username"];
  if (event.queryStringParameters) {
    if ("id" in event.queryStringParameters) {
      const { id } = event.queryStringParameters;

      const getItemResponse = await dbClient.send(
        new QueryCommand({
          TableName: process.env.TABLE_NAME,
          // Key: {
          //   id: {
          //     S: id,
          //   },
          // },
          FilterExpression: "userName = :userName",
          // ExpressionAttributeNames: { "#userName": "userName" },
          ExpressionAttributeValues: {
            ":userName": { S: userName },
            ":id": { S: id },
          },
          KeyConditionExpression: "id = :id",
          // Key: marshall({
          //   id: id,
          //   userName: userName,
          // }),
        })
      );

      if (getItemResponse.Items) {
        const unMarshalledResult = unmarshall(getItemResponse.Items[0]);
        return {
          statusCode: 200,
          body: JSON.stringify(unMarshalledResult),
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

  const result = await dbClient.send(
    new ScanCommand({
      TableName: process.env.TABLE_NAME,
      FilterExpression: "userName = :userName",
      // ExpressionAttributeNames: { "#userName": "userName" },
      ExpressionAttributeValues: {
        ":userName": { S: userName },
      },
      // ProjectionExpression: "author, title, description", // to only get these fields
    })
  );
  // result will be marshlled, with data types
  console.log(result.Items);

  const unmarshalledResults = result.Items.map((item) => unmarshall(item));
  return {
    statusCode: 200,
    body: JSON.stringify(unmarshalledResults),
  };
}

async function putHandler(
  event: APIGatewayProxyEvent,
  dbClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  //event ==> requestContext.authorizer.claims.email or cognito:username
  const userName = event.requestContext.authorizer?.claims["cognito:username"];
  if (
    event.queryStringParameters &&
    "id" in event.queryStringParameters &&
    event.body
  ) {
    const parsedBody = JSON.parse(event.body);
    const requestBodyKey = Object.keys(parsedBody);
    // const requestBodyKey = Object.keys(parsedBody)[0];
    // const updatedVal = parsedBody[requestBodyKey];
    const { id } = event.queryStringParameters;

    const updatedRes = await dbClient.send(
      new UpdateItemCommand({
        TableName: process.env.TABLE_NAME,
        Key: marshall({
          id: id,
          // userName: userName,
        }),
        ConditionExpression: "userName = :userName",
        UpdateExpression: `SET ${requestBodyKey
          .map((k, index) => `#field${index} = :value${index}`)
          .join(", ")}`,
        ExpressionAttributeNames: requestBodyKey.reduce(
          (accumulator, k, index) => ({
            ...accumulator,
            [`#field${index}`]: k,
          }),
          {}
        ),
        ExpressionAttributeValues: marshall(
          requestBodyKey.reduce(
            (accumulator, k, index) => ({
              ...accumulator,
              [`:value${index}`]: parsedBody[k],
            }),
            { ":userName": userName }
          )
        ),
        ReturnValues: "UPDATED_OLD",
      })
    );
    console.log("UPDATED_OLD", unmarshall(updatedRes.Attributes));

    return {
      statusCode: 204,
      body: JSON.stringify(unmarshall(updatedRes.Attributes)),
    };
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify("Bad Input"),
    };
  }
}

async function deleteHandler(
  event: APIGatewayProxyEvent,
  dbClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  const isAuthorize = hasAdminGroup(event);
  if (!isAuthorize) {
    return {
      statusCode: 401,
      body: JSON.stringify("Not AUthorize"),
    };
  }
  if (event.queryStringParameters) {
    if ("id" in event.queryStringParameters) {
      const { id } = event.queryStringParameters;

      const deleteItemResponse = await dbClient.send(
        new DeleteItemCommand({
          TableName: process.env.TABLE_NAME,
          Key: marshall(id),
        })
      );
      return {
        statusCode: 200,
        body: JSON.stringify("Item Deleted"),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify("Id required"),
      };
    }
  }
  const result = await dbClient.send(
    new ScanCommand({
      TableName: process.env.TABLE_NAME,
    })
  );
  // result will be marshlled, with data types
  console.log(result.Items);

  const unmarshalledResults = result.Items.map((item) => unmarshall(item));
  return {
    statusCode: 201,
    body: JSON.stringify(unmarshalledResults),
  };
}
export { handler };
