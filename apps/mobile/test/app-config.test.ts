import appConfig from "../app.json";

describe("Android application configuration", () => {
  it("keeps the prototype Android-only and portrait-oriented", () => {
    expect(appConfig.expo.platforms).toEqual(["android"]);
    expect(appConfig.expo.orientation).toBe("portrait");
    expect(appConfig.expo.android.package).toBe("com.jnd.mobile");
    expect(appConfig.expo.scheme).toBe("jnd");
  });
});
