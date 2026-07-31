import { Redirect, useLocalSearchParams } from "expo-router";

export default function JamaahDetailsScreen() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={{ pathname: "/(tabs)/jamaahs", params: { jamaahId: id } }} />;
}
