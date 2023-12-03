import * as cdk from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class PhotoStack extends cdk.Stack {
  private stackSuffix: string;
  public readonly photosBucketArn: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.inittializeSuffix();

    const bucket = new Bucket(this, "PhotoBucket", {
      bucketName: `photosbucket-${this.stackSuffix}`,
    });

    this.photosBucketArn = bucket.bucketArn;

    // overrirde method
    // (bucket.node.  defaultChild as CfnBucket).overrideLogicalId("PhotoBucket233");

    // new cdk.CfnOutput(this, "photos-bucket", {
    //   value: bucket.bucketArn,
    //   exportName: "photos-bucket",
    // });
  }

  private inittializeSuffix() {
    const shortStackId = cdk.Fn.select(2, cdk.Fn.split("/", this.stackId));
    this.stackSuffix = cdk.Fn.select(4, cdk.Fn.split("-", shortStackId));
  }
}
