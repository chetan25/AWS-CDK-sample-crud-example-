import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { getSuffixFromStack } from "../utils";
import { join } from "path";
import { existsSync } from "fs";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Distribution, OriginAccessIdentity } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";

export class UIDeploymentStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const suffix = getSuffixFromStack(this);

    const deploymentBucket = new Bucket(this, "BooksFEDeploymentBucket", {
      bucketName: `books-fe-bucket-${suffix}`,
    });

    const distFolder = join(__dirname, "../../../../books-fe/dist");
    if (!existsSync(distFolder)) {
      console.log("Folder does not exist");
      return;
    }

    new BucketDeployment(this, "BooksFEBucketDeployment", {
      destinationBucket: deploymentBucket,
      sources: [Source.asset(distFolder)],
    });

    // to make distribution read from bucket we create identity
    const originIdentity = new OriginAccessIdentity(this, "BooksFEAccessId");
    deploymentBucket.grantRead(originIdentity);

    const distribution = new Distribution(this, "BooksUIDistribution", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: new S3Origin(deploymentBucket, {
          originAccessIdentity: originIdentity, // give that idientity here
        }),
      },
    });

    new CfnOutput(this, "DistributionBooksFeOutput", {
      value: distribution.distributionDomainName,
    });
  }
}
