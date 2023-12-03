import { App } from "aws-cdk-lib";
import { DataStack } from "./stacks/DataStacks";
import { LambdaStack } from "./stacks/LambdaStack";
import { ApiStack } from "./stacks/ApiStack";
import { AuthStack } from "./stacks/AuthStack";
import { UIDeploymentStack } from "./stacks/UIDeploymentStack";
import { MonitoringStack } from "./stacks/MonitoringStack";

const app = new App();
const dataStack = new DataStack(app, "DataStack");
const lambdaStack = new LambdaStack(app, "LambdaStack", {
  booksTable: dataStack.booksTable,
});

const authStack = new AuthStack(app, "AuthStack", {
  booksPhotosBucket: dataStack.booksPhotosBucket,
});

new ApiStack(app, "ApiStack", {
  lambdaIntegration: lambdaStack.lambdaIntegration,
  userPool: authStack.userPool,
});

new UIDeploymentStack(app, "UIStack");

new MonitoringStack(app, "ApiMonitoringStack");
