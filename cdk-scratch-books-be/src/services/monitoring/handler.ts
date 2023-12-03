import { Context, SNSEvent } from "aws-lambda";

const webHookUrl = "Your Web Hook Url";

async function handler(event: SNSEvent, context: Context) {
  for (const record of event.Records) {
    await fetch(webHookUrl, {
      method: "POST",
      body: JSON.stringify({
        text: record.Sns.Message,
      }),
    });
  }
}

export { handler };
