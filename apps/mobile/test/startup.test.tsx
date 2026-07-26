import { render } from "@testing-library/react-native";
import { Redirect } from "expo-router";
import Index from "../app/index";

describe("application startup", () => {
  it("redirects to the login route", () => {
    render(<Index />);

    expect(Redirect).toHaveBeenCalledWith(
      expect.objectContaining({ href: "/(auth)/login" }),
      expect.any(Object),
    );
  });
});
