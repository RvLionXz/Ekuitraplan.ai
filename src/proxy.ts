export { auth as proxy } from "@/auth";

export const config = {
  // Protect these routes — require authentication
  matcher: ["/dashboard/:path*", "/chat/:path*", "/trips/:path*"],
};
