export type SubmitProfileInput = {
  displayName: string;
  phone: string | null;
  isAdultConfirmed: boolean;
  selfie: {
    base64: string;
    contentType: string;
  };
};

export type SubmitProfileResult = {
  errorMessage: string | null;
};

export interface ProfileRepository {
  hasSubmittedProfile(): Promise<boolean>;
  submitProfile(input: SubmitProfileInput): Promise<SubmitProfileResult>;
}
