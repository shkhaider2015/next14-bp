import { AUTHORIZATION } from "@/constants/server";
import { decrypt } from "@/lib/auth";
import { errorResponse } from "@/lib/common";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const accessToken = request.headers.get(AUTHORIZATION);

  if (!accessToken)
    return NextResponse.json(
      {
        message: "Token is required to access the resources",
        data: null,
      },
      {
        status: 403,
      }
    );

  try {
    await decrypt(accessToken);
    return NextResponse.json(
      {
        message: "",
        data: {
          access: true,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.log("Error : ", error)
    return errorResponse(error);
  }
}
