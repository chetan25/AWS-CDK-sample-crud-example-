import { APIGatewayProxyEvent } from "aws-lambda";
import { Book } from "./model/model";

export class RequiredFieldError extends Error {
  constructor(requiredField: string) {
    super(`Value for ${requiredField} is expected`);
  }
}
export function validator(args: any) {
  const { id, title, description, author, userName } = args as Book;
  if (!title) {
    throw new RequiredFieldError("title");
  }
  if (!id) {
    throw new RequiredFieldError("id");
  }
  if (!author) {
    throw new RequiredFieldError("name");
  }
  if (!description) {
    throw new RequiredFieldError("description");
  }

  if (!userName) {
    throw new RequiredFieldError("userName");
  }
}

export class JsonParseError extends Error {
  constructor() {
    super("Error parsing json");
  }
}
export function parseJson(inp: string) {
  try {
    return JSON.parse(inp);
  } catch (error) {
    throw new JsonParseError();
  }
}

export function hasAdminGroup(event: APIGatewayProxyEvent) {
  const groups = event.requestContext.authorizer?.claims["cognito:groups"];
  if (groups) {
    return (groups as string).includes("admins");
  }
  return false;
}
