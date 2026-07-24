import { chromium } from "playwright";

async function main() {
  try {
    const browser = await chromium.launch({ headless: true });
    console.log("Lancement réussi !");
    await browser.close();
  } catch (e) {
    console.log("ERREUR COMPLETE:");
    console.log(e);
  }
}
main();
