export type TContentTypes = "JSON" | "FORM" | "WRONG" | undefined;

export interface IAPIResponse {
    data: FormData | null;
    message: string;
  }