type ClassValue = string | undefined | null | false | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const classes = inputs.flatMap((input) => {
    if (!input) return "";
    if (typeof input === "string") return input;
    if (Array.isArray(input)) return cn(...input);
    return "";
  });
  return classes.filter(Boolean).join(" ");
}