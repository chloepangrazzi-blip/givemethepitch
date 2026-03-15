import { getLegacyPageByFilename } from "./legacy-html";

const FILENAME = "keyaccess.html";

export function getKeyAccessPageData() {
  return getLegacyPageByFilename(FILENAME);
}
