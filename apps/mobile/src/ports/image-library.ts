export type ImageLibraryResult =
  | { status: "cancelled" }
  | { status: "permission-denied" }
  | { status: "selected"; uri: string };

export interface ImageLibrary {
  pickLocationImage(): Promise<ImageLibraryResult>;
}
