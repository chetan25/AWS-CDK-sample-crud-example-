import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { AttributeType, ITable, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { getSuffixFromStack } from "../utils";
import {
  IBucket,
  Bucket,
  HttpMethods,
  BucketAccessControl,
  ObjectOwnership,
} from "aws-cdk-lib/aws-s3";

/**
 * This Stack bootstraps all the Buckets and Table needed
 * for the App.
 * - PhotoBucket
 * -
 */
export class DataStack extends Stack {
  public readonly booksTable: ITable;
  // public readonly deploymentBucket: IBucket;
  public readonly booksPhotosBucket: IBucket;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const suffix = getSuffixFromStack(this);

    // this.deploymentBucket = new Bucket(this, "SpaceDeploymentBucket", {
    //   bucketName: `space-fincder-fe-${suffix}`,
    //   publicReadAccess: true,
    //   websiteIndexDocument: "index.html",
    // });

    this.booksPhotosBucket = new Bucket(this, "BooksPhotoBucket", {
      bucketName: `books-photo-${suffix}`,
      cors: [
        {
          allowedMethods: [HttpMethods.HEAD, HttpMethods.GET, HttpMethods.PUT],
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
        },
      ],
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      objectOwnership: ObjectOwnership.OBJECT_WRITER,
      // accessControl: BucketAccessControl.PUBLIC_READ,
    });

    new CfnOutput(this, "BooksPhotoBucketName", {
      value: this.booksPhotosBucket.bucketName,
    });

    this.booksTable = new Table(this, "BooksTable", {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      tableName: `BooksTable-${suffix}`,
    });
  }
}
