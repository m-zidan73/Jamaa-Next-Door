export type ImageLibraryResult =
  | { status: "cancelled" }
  | { status: "permission-denied" }
  | { status: "selected"; uri: string };

export type SelfieCaptureResult =
  | { status: "cancelled" }
  | { status: "permission-denied" }
  | { status: "error"; message: string }
  | { status: "captured"; uri: string; base64: string; contentType: string };

export interface ImageLibrary {
  captureSelfie(): Promise<SelfieCaptureResult>;
  pickLocationImage(): Promise<ImageLibraryResult>;
}
