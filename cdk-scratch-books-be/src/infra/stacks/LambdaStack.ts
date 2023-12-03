import { Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import {
  Code,
  Function as LambdaFunction,
  Runtime,
} from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

interface LambdaStackProps extends StackProps {
  booksTable: ITable;
}

export class LambdaStack extends Stack {
  public readonly lambdaIntegration: LambdaIntegration;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const { booksTable } = props;
    // only for JS code and without proper bundling
    // const lambdaIntg = new LambdaFunction(this, "hello-lambda", {
    //   runtime: Runtime.NODEJS_18_X,
    //   handler: "hello.main",
    //   code: Code.fromAsset(join(__dirname, "../../services")),
    //   environment: {
    //     TABLE_NAME: props.table.tableName,
    //   },
    // });

    // Bundles and compiles code down using esbuild
    const booksLambdaIntg = new NodejsFunction(this, "BooksLambda", {
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
      entry: join(__dirname, "../../services/books/handler.ts"),
      environment: {
        TABLE_NAME: booksTable.tableName,
      },
    });

    // giving lambda permission to operate on Dynamodb
    booksLambdaIntg.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: [booksTable.tableArn],
        actions: [
          "dynamodb:PutItem",
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
        ],
      })
    );

    booksLambdaIntg.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["logs:*"],
        resources: ["arn:aws:logs:*:*:*"],
      })
    );

    this.lambdaIntegration = new LambdaIntegration(booksLambdaIntg);
  }
}
