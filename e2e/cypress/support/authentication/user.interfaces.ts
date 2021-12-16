export interface User {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
}

export function userToUsername(user: User): string {
  const email = user.email;
  return email.replace("+", "").split("@")[0];
}
