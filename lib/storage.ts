/**
 * Stockage de fichiers chiffré directement en PostgreSQL (colonne Bytes).
 * Les fichiers sont chiffrés AES-256-GCM avant insertion.
 */

import { prisma } from "./prisma";
import { chiffrer, dechiffrer } from "./chiffrement";

export async function uploadFichier(
  userId: string,
  buffer: Buffer,
  nomOriginal: string,
  documentId: string
): Promise<string> {
  const chiffre = chiffrer(buffer);

  await prisma.document.update({
    where: { id: documentId },
    data: { contenuChiffre: new Uint8Array(chiffre) },
  });

  return documentId;
}

export async function recupererFichier(documentId: string, userId: string): Promise<Buffer> {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: { userId: true, contenuChiffre: true },
  });

  if (!doc) throw new Error("Document introuvable");
  if (doc.userId !== userId) throw new Error("Accès refusé : ce document ne vous appartient pas");
  if (!doc.contenuChiffre) throw new Error("Contenu du fichier introuvable");

  return dechiffrer(Buffer.from(doc.contenuChiffre));
}

export async function supprimerFichier(documentId: string, userId: string): Promise<void> {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: { userId: true },
  });

  if (!doc) return;
  if (doc.userId !== userId) throw new Error("Accès refusé");

  await prisma.document.update({
    where: { id: documentId },
    data: { contenuChiffre: null },
  });
}
