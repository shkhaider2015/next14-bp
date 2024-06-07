import { JWTErrorNames } from "@/constants/server";
import { IAPIResponse, TContentTypes } from "@/types/common.types";
import { SHA256 } from "crypto-js";
import { NextRequest, NextResponse } from "next/server";
import { serialize } from "object-to-formdata";

export const _isJSON = (req: NextRequest) => {
  const contentType = req.headers.get("content-type");
  let isJson: TContentTypes = undefined;

  if (!contentType) isJson = undefined;
  else if (contentType === "application/json") isJson = "JSON";
  else if (contentType.includes("multipart/form-data")) isJson = "FORM";
  else isJson = "WRONG";

  return isJson;
};

export const requestPostContent = async (
  req: NextRequest
): Promise<IAPIResponse> => {
  const result: IAPIResponse = {
    data: null,
    message: "",
  };
  const contentType: TContentTypes = _isJSON(req);
  if (!contentType) {
    result.message = "Data in a body is not known";
  }

  // console.log("Request body ", await req.formData())
  if (contentType === "JSON") {
    console.log("JSON ");
    result.data = serialize(await req.json());
  }
  if (contentType === "FORM") {
    console.log("FORM ");
    result.data = await req.formData();
  }
  if (contentType === "WRONG") {
    result.message = "Only JSON or Form data is valid";
  }
  console.log("Resuklt : ", result);
  return result;
};

export const hashPassword = (value: string) => {
  return SHA256(value).toString();
};

export function exclude(data: any, ...keys: any) {
  for (let key of keys) {
    delete data[key];
  }
  return data;
}

export function errorResponse(error: any) {
  let message: any;
  if (error?.name === JWTErrorNames.JWSInvalid) message = "Token is invalid";
  else if (error?.name === JWTErrorNames.JWTExpired)
    message = "Token is expired, Please login";
  else {
    message = error?.message || error;
  }

  return NextResponse.json({
    message,
    data: null,
  });
}
