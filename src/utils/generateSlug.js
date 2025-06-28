function generateSlug(text = "") {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")       // spaces → dashes
    .replace(/[^a-z0-9\-]/g, ""); // strip everything else
}

module.exports = generateSlug;
