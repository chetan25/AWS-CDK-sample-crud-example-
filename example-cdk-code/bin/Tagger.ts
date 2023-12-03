import { IAspect } from "aws-cdk-lib";
import { CfnBucket } from "aws-cdk-lib/aws-s3";
import { IConstruct } from "constructs";

export class BucketTagger implements IAspect {
  constructor(private key: string, private value: string) {}

  visit(node: IConstruct): void {
    console.log("visited" + node.node.id);
    if (node instanceof CfnBucket) {
      node.tags.setTag(this.key, this.value);
    }
  }
}
