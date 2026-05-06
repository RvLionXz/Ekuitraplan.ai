export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface UserSession {
  user: User;
  expires: string;
}