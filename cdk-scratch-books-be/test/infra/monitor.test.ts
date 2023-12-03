import { App } from "aws-cdk-lib";
import { MonitoringStack } from "../../src/infra/stacks/MonitoringStack";
import { Capture, Match, Template } from "aws-cdk-lib/assertions";

describe("Monitor Test", () => {
  let monitorStackTemplate: Template;
  beforeAll(() => {
    // create application
    const application = new App({
      outdir: "cdk.out",
    });

    // genertae template
    const monitorStack = new MonitoringStack(application, "MonitorStack");
    monitorStackTemplate = Template.fromStack(monitorStack);
  });

  test("Inital Test", () => {
    // // create application
    // const application = new App({
    //   outdir: "cdk.out",
    // });

    // // genertae template
    // const monitorStack = new MonitoringStack(application, "MonitorStack");
    // const monitorStackTemplate = Template.fromStack(monitorStack);

    // assertion
    monitorStackTemplate.hasResourceProperties("AWS::Lambda::Function", {
      Handle: "index.handler",
      Runtime: "nodejs18.x",
    });
  });

  test("SNS Subscription Test", () => {
    // assertion
    monitorStackTemplate.hasResourceProperties(
      "AWS::SNS::Subscription",
      Match.objectEquals({
        Protocol: "lambda",
        TopicArn: {
          Ref: Match.stringLikeRegexp("AlarmTopic"),
        },
        Endpoint: {
          "Fn::GetAtt": [Match.stringLikeRegexp("webHookLambda"), "Arn"],
        },
      })
    );
  });

  test("Alarm Actions", () => {
    const alarmActionCapture = new Capture();
    monitorStackTemplate.hasResourceProperties("AWS::CloudWatch::Alarm", {
      AlarmActions: alarmActionCapture,
    });

    expect(alarmActionCapture.asArray()).toEqual([
      {
        Ref: expect.stringMatching(/^AlarmTopic/),
      },
    ]);
  });

  test("Simple Snapshot test", () => {
    const snsTopic = monitorStackTemplate.findResources("AWS::SNS::Topic");
    expect(snsTopic).toMatchSnapshot();
  });
});
