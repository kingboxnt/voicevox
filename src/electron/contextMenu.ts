import { Menu } from "electron";

export const textEditContextMenu = Menu.buildFromTemplate([
  { label: "剪切", role: "cut" },
  { label: "复制", role: "copy" },
  { label: "粘贴", role: "paste" },
  { type: "separator" },
  { label: "全选", role: "selectAll" },
]);
