import { IUser } from "@/types/user.types";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { env } from "process";

const secretKey = process.env.SECRET_KEY;
const alogorith = 'HS256';
const key = new TextEncoder().encode(secretKey);
export const auth_session_name = 'auth_session_next14';

export async function encrypt(payload:{ user:IUser; expires: Date }) {
    return await new SignJWT(payload)
    .setProtectedHeader({ alg: alogorith })
    .setIssuedAt()
    .setExpirationTime('10 sec from now')
    .sign(key);

}

export async function decrypt(input:string):Promise<any> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: [alogorith]
    });

    return payload;
}

export async function login(user:IUser) {
    const expires = new Date(Date.now() + 10 * 100);
    const session = await encrypt({ user, expires });

    cookies().set(auth_session_name, session, { expires, httpOnly: true })
    return session;
}

export async function logout() {
    cookies().set(auth_session_name, '', {expires: new Date(0)})
}

export async function getSession() {
    const session = cookies().get(auth_session_name)?.value;
    if(!session) return null;
    return await decrypt(session);
}

export async function updateSession(request:NextRequest) {
    const session = request.cookies.get(auth_session_name)?.value;
    if(!session) return;

    const parsed = await decrypt(session);
    parsed.expires = new Date(Date.now() + 10 * 1000);
    const res = NextResponse.next();

    res.cookies.set({
        name: auth_session_name,
        value: await encrypt(parsed),
        httpOnly: true,
        expires: parsed.expires
    });

    return res;
}