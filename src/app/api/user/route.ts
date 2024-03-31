import { hashPassword, requestPostContent } from "@/lib/common";
import { NextRequest, NextResponse } from "next/server";
import _ from "lodash";
import validator from "validator";
import { Prisma } from "@prisma/client";
import prismaInstance from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");

  try {
    let user = await prismaInstance.user.findUnique({
      where: {
        email: email || "",
      },
    });

    console.log("User ", user);

    if (_.isEmpty(user)) throw "User not found";

    return NextResponse.json({
      data: user,
      message: "User is found successfully",
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
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
        message: error || "Something went wrong",
      },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  let errors: string[] = [];
  const { data, message } = await requestPostContent(request);

  console.log("Data : ", data);
  if (!data) {
    return NextResponse.json({ data, message }, { status: 401 });
  }

  let email: string = data?.get("email")?.toString() || "";
  let password: string = data.get("password")?.toString() || "";
  let confirmPassword: string = data.get("confirmPassword")?.toString() || "";
  let fullName: string = data.get("fullName")?.toString() || "";

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
  if (!_.isEqual(password, confirmPassword))
    errors.push("Confirm password is not matched");

  if (!_.isEmpty(errors)) {
    return NextResponse.json({ data: null, message: errors });
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
      if (error.code == "P2002") {
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
}

export async function PATCH(request: NextRequest) {
  const { data, message } = await requestPostContent(request);

  if (!data) {
    return NextResponse.json({ data, message }, { status: 401 });
  }

  let id = data?.get("id")?.toString() || "";
  let fullName = data?.get("fullName")?.toString() || "";
  let gender = data?.get("gender")?.toString() || "NOT_SPECIFIED";
  let uploaded_image:any = data?.get("profile_image");
  let age = data?.get("age")?.toString() || "";

  try {
    let profile_image = null;
    if (uploaded_image) {
      const buffer = Buffer.from(await uploaded_image.arrayBuffer());
      const filename = Date.now() + uploaded_image.name.replaceAll(" ", "_");

      await writeFile(
        path.join(process.cwd(), "public/uploads/" + filename),
        buffer
      );

      profile_image = 'uploads/' + filename
    }

    let info_toBeUpdate: any = {};
    if (!_.isEmpty(fullName)) info_toBeUpdate.fullName = fullName;
    if (!_.isEmpty(gender)) info_toBeUpdate.gender = gender;
    if(!_.isEmpty(profile_image)) info_toBeUpdate.profile_image = profile_image;
    if (!_.isEmpty(age)) info_toBeUpdate.age = age;

    if (_.isEmpty(id)) throw "User id is required";

    const user = await prismaInstance.user.update({
      where: {
        id,
      },
      data: {
        ...info_toBeUpdate,
      },
    });

    if (!user) throw "User id is not valid";
    // delete user.password
    return NextResponse.json(
      { data: user, message: "User updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
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
        message: error || "Something went wrong",
      },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {}

export async function DELETE(request: NextRequest) {}
