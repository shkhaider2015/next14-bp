import { IUser } from "@/types/user.types";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { env } from "process";
import prismaInstance from "../prisma";
import { hashPassword } from "../common";

const secretKey = process.env.SECRET_KEY;
const alogorith = "HS256";
const key = new TextEncoder().encode(secretKey);
export const auth_session_name = "auth_session_next14";

export async function encrypt(payload: { user: IAuthData; expires: Date }, type:"ACCESS"|"REFRESH") {
  const expirationTime = type === "ACCESS" ? "60 seconds from now" : "180 seconds from now"
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: alogorith })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: [alogorith],
  });

  return payload;
}

export async function login(userData: {email:string; password:string}) {

    const user = await prismaInstance.user.findFirst({
      where: {
        email: userData.email,
        password: hashPassword(userData.password)
      }
    });

    if(!user) return null;
    const tokenData:IAuthData = {
      email: user.email,
      id: user.id
    }

    let print3 = await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve("")
      }, 3000);
    })
    const expires = new Date(Date.now() + 60 * 100);
    const session = await encrypt({ user: tokenData , expires }, "ACCESS");

  
    cookies().set(auth_session_name, session, { expires, httpOnly: true,})
    
    return session;


}

export async function logout() {
  cookies().set(auth_session_name, "", { expires: new Date(0) });
}

export async function getSession() {
  const session = cookies().get(auth_session_name)?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get(auth_session_name)?.value;
  if (!session) return;

  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + 10 * 1000);
  const res = NextResponse.next();

  res.cookies.set({
    name: auth_session_name,
    value: await encrypt(parsed, "ACCESS"),
    httpOnly: true,
    expires: parsed.expires,
  });

  return res;
}

export async function createTokens(user: IAuthData) {
  const accessTokenExpres = new Date(Date.now() + 60 * 100);
  const refreshTokenExpres = new Date(Date.now() + 120 * 100);
  const accessToken = await encrypt({ user, expires: accessTokenExpres }, "ACCESS");
  const refreshToken = await encrypt({
    user: user,
    expires: refreshTokenExpres,
  }, "REFRESH");

  return {
    accessToken,
    refreshToken,
  };
}

export async function updateAccessToken(data: IAuthData) {
  const accessTokenExpres = new Date(Date.now() + 60 * 100);
  const accessToken = await encrypt({ user: data, expires: accessTokenExpres }, "ACCESS");
  return accessToken
}

export async function getUserRole(userId:string | undefined)
{
  if(!userId) return null
  try {
    let user = await prismaInstance.user.findFirstOrThrow({
      where: {
        id: userId
      }
    })
    
    return user.role
  } catch (error) {
    console.error("User ", error)
    return null
  }
}

interface IAuthData {
  email: string;
  id: string;
  password?: string;
}
