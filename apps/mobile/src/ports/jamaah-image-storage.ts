export type JamaahImageUpload = {
  base64: string;
  contentType: string;
};

export type JamaahImageStorageResult = {
  path: string | null;
  errorMessage: string | null;
};

export interface JamaahImageStorage {
  upload(image: JamaahImageUpload): Promise<JamaahImageStorageResult>;
  remove(path: string): Promise<void>;
}
