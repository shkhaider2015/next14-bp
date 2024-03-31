import { login } from "@/lib/auth";
import { exclude, hashPassword, requestPostContent } from "@/lib/common";
import prismaInstance from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import _ from "lodash";
import { NextRequest, NextResponse } from "next/server";
import validator from "validator";

export async function POST(request: NextRequest) {
    let errors: string[] = [];
    const { data, message } = await requestPostContent(request);
  
    console.log("Data : ", data);
    if (!data) {
      return NextResponse.json({ data, message }, { status: 401 });
    }
  
    let email: string = data?.get("email")?.toString() || "";
    let password: string = data.get("password")?.toString() || "";
  
    if (!email) errors.push("Email is required");
    if (!password) errors.push("Password is required");
    if (email && !validator.isEmail(email)) errors.push("Email is not valid");


  
    if (!_.isEmpty(errors)) {
      return NextResponse.json({ data: null, message: errors });
    }
  
    try {
      const user = await prismaInstance.user.findFirstOrThrow({
        where: { email, password: hashPassword(password) },
        
      });

      const token = await login({email: user.email, password: user.id})
      const updatedUser = exclude(user, 'password')

      return NextResponse.json(
        {
          message: "User found successfully",
          data: {
            ...updatedUser,
            access_token: token
          },
        },
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