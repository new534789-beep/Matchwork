// Vérifie les premiers octets du fichier (magic bytes) pour s'assurer que le
// contenu réel correspond au MIME type déclaré — un attaquant peut renommer
// n'importe quel fichier avec l'extension/MIME qu'il veut.

function matches(buffer: Buffer, offset: number, bytes: number[]): boolean {
  if (buffer.length < offset + bytes.length) return false;
  return bytes.every((b, i) => buffer[offset + i] === b);
}

export function detecterTypeReel(buffer: Buffer): string | null {
  if (matches(buffer, 0, [0x25, 0x50, 0x44, 0x46])) return "application/pdf"; // %PDF
  if (matches(buffer, 0, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (matches(buffer, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (
    matches(buffer, 0, [0x52, 0x49, 0x46, 0x46]) && // "RIFF"
    matches(buffer, 8, [0x57, 0x45, 0x42, 0x50]) // "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export function fichierValide(buffer: Buffer, mimeDeclare: string): boolean {
  const typeReel = detecterTypeReel(buffer);
  return typeReel !== null && typeReel === mimeDeclare;
}
