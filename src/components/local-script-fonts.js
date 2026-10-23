export async function showInstalledScriptFonts(root = document) {
  await Promise.all(
    Array.from(root.querySelectorAll(".local-font-card"), async (card) => {
      let available = false;
      try {
        const faces = await root.fonts.load(
          `88px "${card.dataset.fontFamily}"`,
          "S.M",
        );
        available = faces.some((face) => face.status === "loaded");
      } catch {
        // Missing local fonts must never produce a substitute specimen.
      }
      card.querySelector(".local-font-preview").hidden = !available;
      card.querySelector(".font-unavailable").hidden = available;
      card.querySelector(".font-local-status").textContent = available
        ? "Using your installed font. No font file is bundled."
        : "Font unavailable to this browser. No substitute shown.";
      card.dataset.fontState = available ? "available" : "unavailable";
    }),
  );
}
