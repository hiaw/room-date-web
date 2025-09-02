export function getAgeFromBirthDate(birthDate: string | number): number | null {
  if (!birthDate) return null;
  const birth =
    typeof birthDate === "string" ? new Date(birthDate) : new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function formatGenderIdentity(genderIdentity?: string[]): string {
  if (!genderIdentity || genderIdentity.length === 0) return "Not specified";
  return genderIdentity
    .map((g) => g.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()))
    .join(", ");
}

export function formatLanguages(
  languages?: { language: string; proficiency?: string }[],
): string {
  if (!languages || languages.length === 0) return "None specified";
  return languages
    .map((l) =>
      l.proficiency ? `${l.language} (${l.proficiency})` : l.language,
    )
    .join(", ");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatLocation(profile: any): string {
  const parts = [];
  if (profile?.city) parts.push(profile.city);
  if (profile?.state) parts.push(profile.state);
  if (profile?.country) parts.push(profile.country);
  return parts.join(", ") || "Location not set";
}
