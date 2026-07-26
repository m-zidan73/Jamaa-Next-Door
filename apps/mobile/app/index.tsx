import { Redirect } from "expo-router";
import { routes } from "../src/navigation/routes";

export default function Index() {
  return <Redirect href={routes.login} />;
}
