declare module "next-auth" {
  interface User {
    username: string;
    role: string;
  }
}
