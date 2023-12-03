import {
  signIn,
  getCurrentUser,
  fetchAuthSession,
  JWT,
  AuthUser,
  decodeJWT,
} from "aws-amplify/auth";
import { Amplify } from "aws-amplify";
import { AuthStack } from "../../../cdk-scratch-books-be/booksBETemplate.json";
import {
  CognitoIdentityClient,
  GetCredentialsForIdentityCommand,
  CognitoIdentity,
  CreateIdentityPoolCommand,
  GetIdCommand,
} from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

const awsRegion = "eu-east-1";

// Amplify.configure({
//   Auth: {
//     Cognito: {
//       // region: awsRegion,
//       userPoolId: AuthStack.BooksUserPoolId,
//       userPoolClientId: AuthStack.BooksUserPoolClientId,
//       identityPoolId: AuthStack.BooksIdentityPoolId,
//       // authenticationFlowType: "USER_PASSWORD_AUTH",
//     },
//   },
// });

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: AuthStack.BooksUserPoolId,
      userPoolClientId: AuthStack.BooksUserPoolClientId,
    },
  },
});

export class AuthService {
  private user: AuthUser | undefined;
  public jwtToken: string | undefined;
  private temporaryCredentials: object | undefined;

  public isAuthorized() {
    if (this.user) {
      return true;
    }
    return false;
  }

  public async login(
    userName: string,
    password: string
  ): Promise<AuthUser | undefined> {
    try {
      const { isSignedIn } = await signIn({
        username: userName,
        password,
        options: {
          authFlowType: "USER_PASSWORD_AUTH",
        },
      });

      console.log({ isSignedIn });
      // this.user = (await signIn({
      //   username: userName,
      //   password,
      // })) as {};
      const { username, userId, signInDetails } = await getCurrentUser();

      this.user = {
        username,
        userId,
        signInDetails,
      } as AuthUser;
      console.log({ signInDetails });

      // let tokenKey = null;
      // for (var i = 0; i < localStorage.length; i++) {
      //   if (localStorage.key(i)!.includes("idToken")) {
      //     tokenKey = localStorage.key(i);
      //   }
      // if (localStorage.key(i)!.includes("accessToken")) {
      //   console.log(decodeJWT(localStorage.getItem(localStorage.key(i)!)!));
      // }
      // }
      // if (tokenKey) {
      //   this.jwtToken = localStorage.getItem(tokenKey)!;
      //   // console.log(decodeJWT(this.jwtToken));
      // }
      const { accessToken, idToken } =
        (
          await fetchAuthSession({
            forceRefresh: false,
          })
        ).tokens ?? {};
      console.log(idToken?.toString());
      this.jwtToken = idToken?.toString();
      // this.jwtToken = this.user
      //   ?.getSignInUserSession()
      //   ?.getIdToken()
      //   .getJwtToken();
      return this.user;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  public async getTemporaryCredentials() {
    if (this.temporaryCredentials) {
      return this.temporaryCredentials;
    }
    this.temporaryCredentials = await this.generateTemporaryCredentials();
    return this.temporaryCredentials;
  }

  public getUserName() {
    return this.user?.username;
  }

  /**
   * Not working currently
   * call to https://cognito-identity.eu-east-1.amazonaws.com/ fails
   */
  private async generateTemporaryCredentials() {
    // cognito-identity.eu-east-1.amazonaws.com
    const cognitoIdentityPool = `cognito-idp.${awsRegion}.amazonaws.com/${AuthStack.BooksUserPoolId}`;
    console.log("sendcomand");
    // const cognito = new CognitoIdentity({ region: awsRegion });
    // console.log({ cognito });
    // const identity = await cognito.getId({
    //   IdentityPoolId: AuthStack.BooksIdentityPoolId,
    // });
    // console.log({ identity });
    // const credentialResponse = await cognito.getCredentialsForIdentity({
    //   IdentityId: identity.IdentityId,
    // });
    // const credentials = credentialResponse.Credentials!;

    // console.log("sendcommand");
    // const response = await client.send(command);
    // console.log({ credentials });
    const cognitoIdentity = new CognitoIdentityClient({
      credentials: fromCognitoIdentityPool({
        clientConfig: {
          region: awsRegion,
        },
        identityPoolId: AuthStack.BooksIdentityPoolId,
        logins: {
          [cognitoIdentityPool]: this.jwtToken!,
        },
      }),
    });
    // const command = new GetCredentialsForIdentityCommand({
    //   IdentityId: AuthStack.BooksIdentityPoolId,
    //   Logins: {
    //     // IdentityProviders
    //     "www.amazon.com": this.jwtToken!,
    //   },
    // });
    // const command = new CreateIdentityPoolCommand({
    //   IdentityPoolName: AuthStack.BooksIdentityPoolId, // required
    //   AllowUnauthenticatedIdentities: true,
    //   AllowClassicFlow: true,
    //   SupportedLoginProviders: {
    //     // IdentityProviders
    //     "www.amazon.com": this.jwtToken!,
    //   },
    // });
    // const credentials = await cognitoIdentity.send(command);
    // const client = new CognitoIdentityClient({ region: awsRegion });
    // console.log("test");

    // const identityId = (
    //   await client.send(
    //     new GetIdCommand({
    //       IdentityPoolId: AuthStack.BooksIdentityPoolId,
    //       Logins: {
    //         [cognitoIdentityPool]: this.jwtToken!,
    //       },
    //     })
    //   )
    // ).IdentityId;
    // console.log({ identityId });
    // const credentials = (
    //   await client.send(
    //     new GetCredentialsForIdentityCommand({
    //       IdentityId: identityId,
    //       Logins: {
    //         [cognitoIdentityPool]: this.jwtToken!,
    //       },
    //     })
    //   )
    // ).Credentials;
    const credentials = await cognitoIdentity.config.credentials();

    return credentials;
  }
}
