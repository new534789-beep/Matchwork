// Un même compte peut être écrit avec des casses différentes (autocapitalisation
// mobile, copier-coller) : User.email est @unique mais sensible à la casse en
// Postgres, donc "Jean@Gmail.com" et "jean@gmail.com" créeraient deux comptes
// distincts pour la même personne sans normalisation systématique.
export function normaliserEmail(email: string): string {
  return email.trim().toLowerCase();
}
