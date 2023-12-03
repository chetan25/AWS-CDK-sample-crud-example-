import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AuthService } from "./AuthService";
import {
  DataStack,
  ApiStack,
} from "../../../cdk-scratch-books-be/booksBETemplate.json";
import { SpaceEntry } from "../components/model/model";
import { Book } from "../../../cdk-scratch-books-be/src/services/model/model";

const booksUrl = ApiStack.BooksApiEndpointF2AA70A2 + "books";

type NewBook = Omit<Book, "id" | "userName"> & { photo?: File };

export class DataService {
  private authService: AuthService;
  private s3Client: S3Client | undefined;
  private awsRegion = "eu-east-1";

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  public reserveSpace(spaceId: string) {
    return "123";
  }

  public async getSpaces(): Promise<SpaceEntry[]> {
    const getSpacesResult = await fetch(spacesUrl, {
      method: "GET",
      headers: {
        Authorization: this.authService.jwtToken!,
      },
    });
    const getSpacesResultJson = await getSpacesResult.json();
    return getSpacesResultJson;
  }

  public async addBook(book: NewBook) {
    if (book.photo) {
      book.photoUrl = "";

      // not working
      // const uploadUrl = await this.uploadPublicFile(book.photo!);
      // book.photoUrl = uploadUrl;
    }
    const result = await fetch(booksUrl, {
      method: "POST",
      body: JSON.stringify(book),
      headers: {
        Authorization: this.authService.jwtToken!,
      },
    });
    const postResultJSON = await result.json();
    return postResultJSON.id;
  }

  private async uploadPublicFile(file: File) {
    const credentials = await this.authService.getTemporaryCredentials();
    if (!this.s3Client) {
      this.s3Client = new S3Client({
        credentials: credentials as any,
        region: this.awsRegion,
      });
    }
    const command = new PutObjectCommand({
      Bucket: DataStack.BooksPhotoBucketName,
      Key: file.name,
      ACL: "public-read",
      Body: file,
    });
    await this.s3Client.send(command);
    return `https://${command.input.Bucket}.s3.${this.awsRegion}.amazonaws.com/${command.input.Key}`;
  }

  public isAuthorized() {
    return this.authService.isAuthorized();
  }
}
