import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const root = resolve("dist");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".xml": "application/xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
};
const server = createServer(async (request, response) => {
  try {
    let pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    pathname = pathname.replace(/^\/msrinivasan(?=\/|$)/, "") || "/";
    if (pathname.endsWith("/")) pathname += "index.html";
    const target = resolve(root, `.${pathname}`);
    if (!target.startsWith(root + sep)) {
      response.writeHead(403).end();
      return;
    }
    if (!(await stat(target)).isFile()) throw new Error("Not a file");
    response.writeHead(200, {
      "Content-Type": types[extname(target)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    const data = await readFile(target);
    response.end(request.method === "HEAD" ? undefined : data);
  } catch {
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    const fallback = await readFile(resolve(root, "404.html")).catch(() =>
      Buffer.from("Not found"),
    );
    response.end(fallback);
  }
});
server.listen(Number(process.env.PORT || 4173), "localhost", () => {
  console.log(
    "Production preview: http://localhost:4173/msrinivasan/ (also mounted at /)",
  );
});
