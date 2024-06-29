import { validateToken, changePassword, decrypt } from "@/lib/auth";
import { hashPassword, requestPostContent } from "@/lib/common";
import prismaInstance from "@/lib/prisma";
import _ from "lodash";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { data, message } = await requestPostContent(request);

  if (!data) {
    return NextResponse.json({ data, message }, { status: 401 });
  }

  const errors: string[] = [];
  const token = data?.get("token")?.toString() || "";
  let isReset = Boolean(data?.get("is_reset")?.toString() || "false");

  const oldPassWord = data?.get("old_password")?.toString() || "";
  const newPassword = data?.get("new_password")?.toString() || "";
  const confirmNewPassword =
    data?.get("confirm_new_password")?.toString() || "";

  if (_.isEmpty(token) && isReset) errors.push("Reset password token is required");
  if (_.isEmpty(token) && !isReset) errors.push("User token is required");
  if (_.isEmpty(oldPassWord) && !isReset)
    errors.push("Old password is required");
  if (_.isEmpty(newPassword)) errors.push("New Password is required");
  if (_.isEmpty(confirmNewPassword))
    errors.push("Confirm new password is required");
  if (newPassword.length < 6)
    errors.push("Password length must be at least 6 characters long");
  if (!_.isEqual(newPassword, confirmNewPassword))
    errors.push("Passwords are not matching");

  if (!_.isEmpty(errors)) {
    return NextResponse.json(
      {
        message: errors.join(",\n "),
        data: null,
      },
      { status: 400 }
    );
  }

  try {
    // for reset link password
    if (isReset) {
      let { isValid, email } = await validateToken(token);
      if (!isValid)
        throw { message: "Reset password token is invalid or expired" };
      let user = await prismaInstance.user.findFirst({ where: { email } });
      if (!user) throw { message: "User does not exist" };
      await prismaInstance.user.update({
        where: {
          email,
        },
        data: {
          password: hashPassword(newPassword),
        },
      });
    } else {
      let payload = await decrypt(token);
      let user = await prismaInstance.user.findFirst({
        where: { id: payload?.id },
      });
      if (!user) throw { message: "User does not exist" };
      if (user.password !== hashPassword(oldPassWord) && !isReset)
        throw { message: "Old password is not correct" };
      await prismaInstance.user.update({
        where: { id: payload.id, password: hashPassword(oldPassWord) },
        data: {
          password: hashPassword(newPassword),
        },
      });
    }
    return NextResponse.json(
      {
        message: "Password changed successfully",
        data: null,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error?.message) {
      return NextResponse.json(
        {
          message: error?.message,
          data: null,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        message: "Something wrong happen",
        data: null,
      },
      { status: 400 }
    );
  }
}
