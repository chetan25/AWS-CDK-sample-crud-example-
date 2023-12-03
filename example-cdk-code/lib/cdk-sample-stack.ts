import * as cdk from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import { Bucket, CfnBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkSampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // example resource
    // const queue = new sqs.Queue(this, 'CdkSampleQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    // S3 bucket

    new CfnBucket(this, "BucketL1", {
      lifecycleConfiguration: {
        rules: [
          {
            expirationInDays: 1,
            status: "Enabled",
          },
        ],
      },
    });

    const duration = new cdk.CfnParameter(this, "duration", {
      default: 6,
      minValue: 1,
      maxValue: 10,
      type: "Number",
    });

    const bucketL2 = new Bucket(this, "BucketL2", {
      lifecycleRules: [
        {
          expiration: Duration.days(duration.valueAsNumber),
        },
      ],
    });
    // this won't work as the name is only generated after deployment and cdk synth won't work
    // console.log(bucketL2.bucketName);

    new cdk.CfnOutput(this, "myL2BucketName", {
      value: bucketL2.bucketName,
    });

    new L3Bucket(this, "BucketL3", 2);
  }
}

class L3Bucket extends Construct {
  constructor(scope: Construct, id: string, expiration: number) {
    super(scope, id);

    new Bucket(this, "BucketL3", {
      lifecycleRules: [
        {
          expiration: Duration.days(expiration),
        },
      ],
    });
  }
}
