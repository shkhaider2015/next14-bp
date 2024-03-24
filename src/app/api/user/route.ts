import { hashPassword, requestPostContent } from "@/lib/common";
import { NextRequest, NextResponse } from "next/server";
import _ from "lodash";
import validator from "validator";
import { Prisma } from "@prisma/client";
import prismaInstance from "@/lib/prisma";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET(request: NextRequest) {

}

export async function POST(request: NextRequest) {
  let errors: string[] = [];
  const { data, message } = await requestPostContent(request);

  console.log("Data : ", data)
  if (!data) {
    return NextResponse.json({ data, message }, { status: 401 });
  }

  let email:string = data?.get("email")?.toString() || '';
  let password:string = data.get("password")?.toString() || '';
  let confirmPassword:string = data.get("confirmPassword")?.toString() || '';
  let fullName:string = data.get("fullName")?.toString() || '';

  if (!email) errors.push("Email is required");
  if (!password) errors.push("Password is required");
  if (!confirmPassword) errors.push("Confirm password is required");
  if (!fullName) errors.push("Full name is required");
  if (email && !validator.isEmail(email)) errors.push("Email is not valid");
  if (
    password &&
    !validator.isStrongPassword(password, {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  )
    errors.push(
      "Password must contain at least one lowercase, uppercase, number and symbol"
    );
  if (password && password.length > 20) errors.push("Password is too long");
  if(!_.isEqual(password, confirmPassword)) errors.push("Confirm password is not matched")

  if(!_.isEmpty(errors)) {
    return NextResponse.json({data: null, message: errors})
  }

  try {
    const user = await prismaInstance.user.create({
      data: { email, password: hashPassword(password), fullName },
    });
    return NextResponse.json(
      {
        message: "User created successfully",
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
     if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if(error.code == 'P2002')
      {
        return NextResponse.json(
          {
            message: "This email is already registered",
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          message: error.message,
        },
        { status: 400 }
      );
    }
    console.log("Error ", error);
    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ data: {email, fullName}, message}, {status: 200})

}

export async function PATCH(request: NextRequest) {}

export async function PUT(request: NextRequest) {}

export async function DELETE(request: NextRequest) {}
