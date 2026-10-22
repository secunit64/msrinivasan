export function initializePublicationFilter() {
  const select = document.querySelector("#publication-topic");
  document.querySelector("#publication-controls").hidden = false;
  return select;
}

export function filterPublications(topic) {
  let visible = 0;
  for (const item of document.querySelectorAll(".publication")) {
    item.hidden =
      Boolean(topic) && !JSON.parse(item.dataset.topics).includes(topic);
    if (!item.hidden) visible++;
  }
  document.querySelector("#publication-count").textContent =
    `${visible} ${visible === 1 ? "publication" : "publications"}`;
  return visible;
}
