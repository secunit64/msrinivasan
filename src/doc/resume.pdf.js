import {readFileSync} from "node:fs";
process.stdout.write(readFileSync(new URL("../../doc/resume.pdf", import.meta.url)));
