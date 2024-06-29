import { decrypt, updateAccessToken } from "@/lib/auth";
import { exclude, requestPostContent } from "@/lib/common";
import prismaInstance from "@/lib/prisma";
import { JWTPayload } from "jose";
import _ from "lodash";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let errors: string[] = [];
  const { data, message } = await requestPostContent(request);

  const accessToken: string = data?.get("accessToken")?.toString() || "";
  const refreshToken: string = data?.get("refreshToken")?.toString() || "";
  const device_id: string = data?.get("device_id")?.toString() || "";

  if (_.isEmpty(accessToken)) errors.push("Access token is required");
  if (_.isEmpty(refreshToken)) errors.push("Refresh token is required");
  if (_.isEmpty(device_id)) errors.push("device_id is required");

  if (!_.isEmpty(errors)) {
    return NextResponse.json({
      message: errors.join(",\n "),
      data: null,
    });
  }
  let payload: any = null;
  try {
    payload = await decrypt(accessToken);
    // return user data
    const userId: string | undefined = payload?.user?.id;
    let user = await prismaInstance.user.findFirstOrThrow({
      where: {
        id: userId,
      },
      include: {
        token: {
          where: {
            device: device_id
          }
        },
      },
    });
    if(!user.is_active) throw({message: 'User is not activated'})
    if(user.token.length > 0 && user.token.every(item => !item.blackListed)) throw('Token is black listed')
    let updatedUser = exclude(user, ["password"]);

    return NextResponse.json(
      { message: "success access payload", data: {
        ...updatedUser,
        token: {
          accessToken,
          refreshToken
        }
      }, payload },
      { status: 200 }
    );
  } catch (error: any) {
    if (error?.name === "JWSInvalid") {
      return NextResponse.json(
        { message: "Invalid access token", data: null },
        { status: 400 }
      );
    } else if (error?.name === "JWTExpired") {
      try {
        payload = await decrypt(refreshToken);
        // Create new access token
        const userId = payload?.user?.id;
        const prevToken = await prismaInstance.token.findFirstOrThrow({
          where: {
            userId: userId,
            device: device_id,
            refreshToken: refreshToken
          }
        })

        const updatedAccessToken = await updateAccessToken({email: payload.email, id: userId})
        const user = await prismaInstance.token.update({
          where: {
            id: prevToken.id
          },
           data: {
            accessToken: updatedAccessToken
           },
           include: {
            user: true
           }
        })
        
        // let user = await prismaInstance.user.findFirstOrThrow({
        //   where: {
        //     id: userId
        //   },
        //   include: {
        //     token: {
        //       where: {
        //         device: device_id
        //       }
        //     }
        //   }
        // })
        // let tokenId = user.token.length ? user.token[0].id : ''
        
        // await prismaInstance.user.update({
        //   where: {
        //     id: userId
        //   },
        //   data: {
        //     token: {
        //       update: {
        //         where: {
        //           id: tokenId
        //         },
        //         data: {
        //           accessToken: updatedAccessToken
        //         }
        //       }
        //     }
        //   }
        // })
        const updatedUser = exclude(user, ['password'])
        return NextResponse.json(
          { message: "success refresh payload", data: {
            ...updatedUser,
            token: {
              refreshToken,
              accessToken: updatedAccessToken
            }
          }, payload },
          { status: 200 }
        );
      } catch (error: any) {
        if (error?.name === "JWSInvalid") {
          return NextResponse.json(
            { message: "Invalid refresh token", data: null },
            { status: 400 }
          );
        } else if (error?.name === "JWTExpired") {
          return NextResponse.json(
            { message: "Token is expired, Please logged in again", data: null },
            { status: 400 }
          );
        } else {
          throw error?.message || error;
        }
      }
    } else {
      return NextResponse.json(
        { message: "Something wrong happened", error: error?.message || error },
        { status: 400 }
      );
    }
  }
}
