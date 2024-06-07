import { changePassword } from "@/lib/auth";
import { requestPostContent } from "@/lib/common";
import _ from "lodash";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { data, message } = await requestPostContent(request);

  if (!data) {
    return NextResponse.json({ data, message }, { status: 401 });
  }

  const errors: string[] = [];
  const userId = data?.get("user_id")?.toString() || "";
  const oldPassWord = data?.get("old_password")?.toString() || "";
  const newPassword = data?.get("new_password")?.toString() || "";
  const confirmNewPassword =
    data?.get("confirm_new_password")?.toString() || "";

  if (_.isEmpty(userId)) errors.push("User id is required");
  if (_.isEmpty(oldPassWord)) errors.push("Old password is required");
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
    await changePassword(userId, oldPassWord, newPassword);
    return NextResponse.json(
      {
        message: "Password changed successfully",
        data: null,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Something wrong happen",
        data: null,
      },
      { status: 400 }
    );
  }
}
