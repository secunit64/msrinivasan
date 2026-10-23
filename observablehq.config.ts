import { siteHead, siteHeader, siteFooter } from "./scripts/layout.mjs";
import { publicationPlugin } from "./scripts/publications.mjs";

export default {
  root: "src",
  output: "dist",
  title: "Madhu Srinivasan",
  style: "styles/site.css",
  sidebar: false,
  pager: false,
  toc: false,
  search: false,
  globalStylesheets: [],
  dynamicPaths: ["/doc/resume.pdf"],
  markdownIt: publicationPlugin,
  preserveExtension: true,
  base: process.env.SITE_BASE || "/",
  head: siteHead,
  header: siteHeader,
  footer: siteFooter,
  pages: [
    { name: "Projects", path: "/projects" },
    { name: "Publications", path: "/publications" },
    { name: "About", path: "/about" },
  ],
};
