---
title: Basic AWS CDK Practice Repo.
excerpt: Simple CRUD operations built with AWS CDK in backend with React in UI.
Tools: ["React", "React Testing Library", "Jest", "Aws CDK"]
---

# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
- `cdk doctor` to do a health check
- `cdk destroy` - delete stack

#### Deployment

- First need to `bootstrap` the cdk environment. `cdk bootstrap`. This will create a `CDKToolkit` stack in CloudFormation, that includes resources to deploy cdk apps
- Then we deploy using `cdk deploy`
- We can use `cdk synth` to just generate the `cdk.out` folder with the templates and not deploy them.
- We can pass parameters to the stack using `cdk.CfnParameter` and setting a local parameter

  ```js
  const duration = new cdk.CfnParameter(this, "duration", {
    default: 6,
    minValue: 1,
    maxValue: 10,
    type: "Number",
  });
  ```

  and then calling the deploy with that parameter
  `cdk deploy --parameters duration=7`

  - Every resources has two Ids, `Logical Id` and `Physical Id`. `Logical Id` is used within CDK to reference the resource and pass info if needed. `Physical Id` is use by AWS to reference the resource.
  - If we change the "logicalId" the id we passed as argument to Bucket, Aws will create a new resources and delete old one. This might lead to data loss. And if we have a custom bucket name that will also fail since names have to be unique.
  - We can get around it by using override.

  ```js
     const bucket = new Bucket(this, "PhotoBucket", {
      bucketName: "photosbucket-38gv3v2hg3",
    });

    // overrirde method
    (bucket.node.defaultChild as CfnBucket).overrideLogicalId("PhotoBucket233");
  ```

- If we need to get some info from one stack in another we can use Cfn

  ```js
  // CFN way of getting info from    different stack, here photo stack, in the photo handler
  const targetBucket = cdk.Fn.importValue("photos-bucket");

  // in photo stack we need use use Cfn Output to export a name
  new cdk.CfnOutput(this, "photos-bucket", {
    value: bucket.bucketArn,
    exportName: "photos-bucket",
  });
  ```

#### Constructs

- Basic building blocks
- 3 level of construct
  - L1 - Low level, cloud formation resources when used need configuration of all properties
  - L2- higher level functionality and provides CDK resources like default, boiler plate and type safety
  - L3 - Is a Pattern based,with multiple resources combine to solve a task, like LambdaRestApi.

#### Intrinsic Functions

```js
CDK Code ======synth===> CF template ===deploy====> AWS CF

```

- `REF` -- reference different information around CF template

#### CDK Aspects

Check or modify resources after they are created. We can use the external dep `cdk nag` to add security rules using aspects

#### AWS Lambda

Challenges

- Dependency management
- Typescript compilation and bundling

Solution - NodeJs Function CDK construct

- Bundles all code with tree shaking
- Compiles TS to JS
- Leaves out AWS-SDK deps
- Editable
- Library: uses esbuild

##### AWS SDK

- Access other AWS services from other services / console

#### AWS DynamoDb

We using the following 'DynamoDBClient' as follow

```js
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const dbClient = new DynamoDBClient({});

const getItemResponse = await dbClient.send(
  new GetItemCommand({
    TableName: process.env.TABLE_NAME,
    Key: {
      id: {
        S: id,
      },
    },
  })
);
```

we need to specify the data types for the items in Dynamodb because they are un marshalled, even the result have data types in them, if we don't specify we will get an error "Cannot read properties of undefined". We can get around it by either:

- Using Marshall and UnMarshall from '@aws-sdk/util-dynamodb' on input and output
- Using the DynamoDBDocumentClient from '@aws-sdk/lib-dynamodb'

#### AWS Cognito

- User Pools

  - Stores user data and provides basic authentication solution, by using JWT

- Identity Pools

  - Provides fine grained access control to a user. A user can assume roles to perform certain actions. They can directly call AWS SDK commands with assigned roles.

We can activate a user from command line using the following command
`aws  cognito-idp admin-set-user-password --user-pool-id <User Pool Id> --username <Username> --pasword <New password> --permanent`

#### CDK Output

We can store the cdk output to file using
`cdk deploy --outputs-file <fileName.json>`

#### Monitoring

- To see the alarms description in ClI we can run `aws cloudwatch describe-alarms`

#### CDK from Scratch

If we are not using the cdk script to scaffold the project `cdk init app --language typescript` we can also do it manually. The `cdk-scratch-example` uses manual scaffold to build an app.

It has folders for specific needs, like infra, services extra. The main file that bootstraps the app is the `launcher.ts` under the infra folder. We have also updated the `cdk.json` `app` entry to point to that.
