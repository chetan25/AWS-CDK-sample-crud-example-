import { Stack, StackProps } from "aws-cdk-lib";
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  Cors,
  LambdaIntegration,
  MethodOptions,
  ResourceOptions,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { IUserPool } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

interface ApiStackProps extends StackProps {
  lambdaIntegration: LambdaIntegration;
  userPool: IUserPool;
}

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: ApiStackProps) {
    super(scope, id, props);

    const { lambdaIntegration, userPool } = props;
    const api = new RestApi(this, "BooksApi");

    const authorizer = new CognitoUserPoolsAuthorizer(this, "BooksAuthorizer", {
      cognitoUserPools: [userPool],
      identitySource: "method.request.header.Authorization",
    });

    authorizer._attachToApi(api);

    const optionsWithAuth: MethodOptions = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: authorizer.authorizerId,
      },
    };

    const optionsWithCors: ResourceOptions = {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
    };

    const booksResources = api.root.addResource("books", optionsWithCors);

    booksResources.addMethod("GET", lambdaIntegration, optionsWithAuth);
    booksResources.addMethod("POST", lambdaIntegration, optionsWithAuth);
    booksResources.addMethod("DELETE", lambdaIntegration, optionsWithAuth);
    booksResources.addMethod("PUT", lambdaIntegration, optionsWithAuth);
  }
}
