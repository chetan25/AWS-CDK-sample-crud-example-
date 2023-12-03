import { handler } from "../../src/services/monitoring/handler";

describe("Simple Lambda", () => {
  const fetchSpy = jest.spyOn(global, "fetch");
  fetchSpy.mockImplementation(() => Promise.resolve({} as any));

  afterEach(() => {
    jest.clearAllMocks();
  });
  test("Simple Lambda", async () => {
    await handler(
      {
        Records: [
          {
            Sns: {
              Message: "Test",
            },
          },
        ],
      } as any,
      {} as any
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
