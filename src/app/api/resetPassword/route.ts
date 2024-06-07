import { resetPassword } from "@/lib/auth/specific";
import { requestPostContent } from "@/lib/common";
import prismaInstance from "@/lib/prisma";
import _ from "lodash";
import { NextRequest, NextResponse } from "next/server";
import validator from "validator";

export async function POST(request: NextRequest) {
  const { data, message } = await requestPostContent(request);

  if (!data) {
    return NextResponse.json({ data, message }, { status: 401 });
  }

  const errors: string[] = [];

  const email = data.get("email")?.toString() || "";

  if (_.isEmpty(email)) errors.push("Email is required");
  if (!validator.isEmail(email)) errors.push("Email is not valid");

  if (!_.isEmpty(errors)) {
    return NextResponse.json(
      { data: null, message: errors.join(",\n") },
      { status: 401 }
    );
  }

  try {
    const user = await prismaInstance.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!user) {
      return NextResponse.json(
        {
          data: null,
          message: "User does not exist please register your email",
        },
        { status: 401 }
      );
    }
    await resetPassword(email);
    return NextResponse.json(
      { data: null, message: "Activation link sent to your email" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { data: null, message: "Something wrong happen" },
      { status: 401 }
    );
  }
}
