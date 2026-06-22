/**
 * Abstraction du stockage de fichiers chiffré.
 * En v1 : stockage local chiffré dans /tmp/matchwork-storage (dev)
 * En production : remplacer par Supabase Storage ou S3.
 * Les fichiers sont chiffrés AES-256-GCM avant écriture.
 */

import fs from "fs/promises";
import path from "path";
import { chiffrer, dechiffrer } from "./chiffrement";
import crypto from "crypto";

const STORAGE_DIR = process.env.STORAGE_LOCAL_DIR ?? path.join(process.cwd(), ".storage");

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export async function uploadFichier(
  userId: string,
  buffer: Buffer,
  nomOriginal: string
): Promise<string> {
  const userDir = path.join(STORAGE_DIR, userId);
  await ensureDir(userDir);

  const ext = path.extname(nomOriginal);
  const ref = `${crypto.randomUUID()}${ext}`;
  const filePath = path.join(userDir, ref);

  const chiffre = chiffrer(buffer);
  await fs.writeFile(filePath, chiffre);

  // La ref stockée encode userId + nom de fichier pour l'isolation
  return `${userId}/${ref}`;
}

export async function recupererFichier(refStockage: string, userId: string): Promise<Buffer> {
  // Vérification : le fichier appartient bien à cet utilisateur
  const [ownerPart] = refStockage.split("/");
  if (ownerPart !== userId) {
    throw new Error("Accès refusé : ce document ne vous appartient pas");
  }

  const filePath = path.join(STORAGE_DIR, refStockage);
  const chiffre = await fs.readFile(filePath);
  return dechiffrer(chiffre);
}

export async function supprimerFichier(refStockage: string, userId: string): Promise<void> {
  const [ownerPart] = refStockage.split("/");
  if (ownerPart !== userId) {
    throw new Error("Accès refusé : ce document ne vous appartient pas");
  }

  const filePath = path.join(STORAGE_DIR, refStockage);
  await fs.unlink(filePath);
}
