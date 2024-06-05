import { NextRequest } from "next/server";
import { updateSession } from "./lib/auth";

export async function middleware(request:NextRequest) {
    console.log("Middleware");
    
    return await updateSession(request)
}

export const config = {
    matcher: [
      /*
       * Match all request paths except for the ones starting with:
       * - api (API routes)
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - favicon.ico (favicon file)
       */
      '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
  }