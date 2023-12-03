import { AuthService } from "./AuthService";

async function logIn() {
  const authServ = new AuthService();
  const result = await authServ.login("<User Name>", "<User Pass>");
  console.log(result.getSignInUserSession().getIdToken().getJwtToken());
}

logIn();
