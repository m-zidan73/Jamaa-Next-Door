/* eslint-env jest, node */

jest.mock("expo-localization", () => ({
  getLocales: () => [{ languageCode: "en" }],
}));

jest.mock("expo-router", () => {
  const React = require("react");
  const { Text } = require("react-native");

  const Link = ({ asChild, children, href, ...props }) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, { accessibilityHint: href });
    }

    return React.createElement(Text, { ...props, accessibilityHint: href }, children);
  };

  const Redirect = jest.fn(() => null);
  const Stack = jest.fn(() => null);
  const Tabs = jest.fn(() => null);
  Stack.Screen = jest.fn(() => null);
  Tabs.Screen = jest.fn(() => null);

  return {
    Link,
    Redirect,
    Stack,
    Tabs,
    router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
    useLocalSearchParams: () => ({ id: "demo" }),
  };
});

jest.mock("@react-native-picker/picker", () => {
  const React = require("react");
  const { Text, View } = require("react-native");

  const Picker = ({ children }) => React.createElement(View, null, children);
  function PickerItem({ label }) {
    return React.createElement(Text, null, label);
  }
  Picker.Item = PickerItem;

  return { Picker };
});
