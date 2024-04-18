import { requestPostContent } from "@/lib/common";
import prismaInstance from "@/lib/prisma";
import _ from "lodash";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let errors: string[] = [];
  const { data, message } = await requestPostContent(request);

  const device_id: string = data?.get("device_id")?.toString() || "";
  const user_id: string = data?.get("user_id")?.toString() || "";


  if (_.isEmpty(device_id)) errors.push("device_id is required");

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
    await prismaInstance.token.updateMany({
      where: {
        userId: user_id,
        device: device_id,
        blackListed: false,
      },
      data: {
        blackListed: true,
      },
    });

    return NextResponse.json(
      {
        message: "Logout success",
        data: null,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.message ? error?.message : error,
        data: null,
      },
      { status: 400 }
    );
  }
}
