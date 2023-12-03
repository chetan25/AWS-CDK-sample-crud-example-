import { type CognitoUser } from "@aws-amplify/auth";
import { Amplify, Auth } from "aws-amplify";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

const awsRegion = "<Your Region>";
const userPoolId = "<User Pool Id>";
const identityPoolId = "<identityPoolId>";
const userPoolWebClientId = "<userPoolWebClientId>";

Amplify.configure({
  Auth: {
    region: awsRegion,
    userPoolId: userPoolId,
    userPoolWebClientId: userPoolWebClientId,
    authenticationFlowType: "USER_PASSWORD_AUTH",
    // identityPoolId: identityPoolId,
  },
});

export class AuthService {
  public async login(userName: string, password: string) {
    const result = await Auth.signIn(userName, password);

    return result as CognitoUser;
  }

  public async generateTempCred(user: CognitoUser) {
    const jwtToken = user.getSignInUserSession().getIdToken().getJwtToken();

    const cognitoIdentiyPool = `cognito-idp.${awsRegion}.amazonaws.com/${userPoolId}`;

    const cognitoIdentity = new CognitoIdentityClient({
      credentials: fromCognitoIdentityPool({
        identityPoolId: identityPoolId,
        logins: {
          [cognitoIdentiyPool]: jwtToken,
        },
      }),
    });

    const credentials = await cognitoIdentity.config.credentials();

    return credentials;
  }
}
