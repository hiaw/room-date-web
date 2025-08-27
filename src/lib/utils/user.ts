interface User {
  name?: string;
  email?: string;
}

export function formatUserName(userData: User | null | undefined): string {
  if (!userData) return "User";
  return userData.name || userData.email || "User";
}

export function getUserDisplayName(
  user: User | string | null | undefined,
): string {
  if (!user) return "User";
  if (typeof user === "string") return user;
  return formatUserName(user);
}
