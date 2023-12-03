#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
// import { CdkSampleStack } from "../lib/cdk-sample-stack";
import { PhotoStack } from "../lib/PhotoStack";
import { PhotoHandlerStack } from "../lib/PhotoHandlerStack";
import { BucketTagger } from "./Tagger";

const app = new cdk.App();
// new CdkSampleStack(app, "CdkSampleStack", {
// /* Uncomment the next line to specialize this stack for the AWS Account
//  * and Region that are implied by the current CLI configuration. */
// env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
// });

// Since the deployment takes alphabatical order,
// deploying it using --all will fail, as that will deploy handler before the photo stack
// so we need to deploy the photoStack first than handler
// new PhotoStack(app, "PhotoStack");
// new PhotoHandlerStack(app, "PhotoHandler", {});

// with this dependency CDK is smart enough to deploy photoStack first and than handler
const photosStack = new PhotoStack(app, "PhotoStack");
new PhotoHandlerStack(app, "PhotoHandler", {
  targetBucketArn: photosStack.photosBucketArn,
});

const tagger = new BucketTagger("level", "test");

cdk.Aspects.of(app).add(tagger);
