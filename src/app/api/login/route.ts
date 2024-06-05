import { createTokens } from "@/lib/auth";
import { exclude, hashPassword, requestPostContent } from "@/lib/common";
import prismaInstance from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import _ from "lodash";
import { NextRequest, NextResponse } from "next/server";
import validator from "validator";

export async function POST(request: NextRequest) {
  let errors: string[] = [];
  const { data, message } = await requestPostContent(request);

  // console.log("Data : ", data);
  if (!data) {
    return NextResponse.json({ data, message }, { status: 401 });
  }

  let email: string = data?.get("email")?.toString() || "";
  let password: string = data.get("password")?.toString() || "";
  let device_id: string = data.get("device_id")?.toString() || "";

  if (!email) errors.push("Email is required");
  if (!password) errors.push("Password is required");
  if (!device_id) errors.push("Device Type is required");
  if (email && !validator.isEmail(email)) errors.push("Email is not valid");

  if (!_.isEmpty(errors)) {
    return NextResponse.json({ data: null, message: errors });
  }

  try {
    const user = await prismaInstance.user.findFirstOrThrow({
      where: { email, password: hashPassword(password) },
      include: {
        token: {
          where: {
            device: device_id,
          },
        },
      },
    });

    // If login again from same device black list previous token
    await prismaInstance.token.updateMany({
      where: {
        device: device_id,
        userId: user.id,
        blackListed: false
      },
      data: {
        blackListed: true,
      },
    });

    // Create new tokens
    const token = await createTokens({
      email: user.email,
      id: user.id,
    });

    // Create new token in database
    await prismaInstance.token.create({
      data: {
        userId: user.id,
        ...token,
        device: device_id,
      },
    });

    // Retrieve user data without password field
    const updatedUser = exclude(user, ["password"]);
    await prismaInstance.$disconnect()
    return NextResponse.json(
      {
        message: "User found successfully",
        data: {
          ...updatedUser,
          token: token,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        {
          message: error.message,
          error,
        },
        { status: 400 }
      );
    }
    console.log("Error ", error);
    return NextResponse.json(
      {
        message: error || "Something went wrong",
      },
      { status: 400 }
    );
  }
}
