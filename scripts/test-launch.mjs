import { chromium } from "playwright";
try {
  // Le téléchargement séparé de chrome-headless-shell est bloqué au niveau
  // réseau (0 octet reçu après plusieurs minutes) ; on pointe directement
  // sur le Chromium complet déjà présent, qui fonctionne très bien en headless.
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Users\\hp\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
    timeout: 45000,
  });
  console.log("LAUNCHED OK");
  await browser.close();
} catch (e) {
  console.log("FULL ERROR:", e.message);
}
