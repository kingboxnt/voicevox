import { Encoding as EncodingType } from "@/type/preload";
import {
  AllActions,
  SaveResultObject,
  WriteErrorTypeForSaveAllResultDialog,
} from "@/store/type";
import SaveAllResultDialog from "@/components/SaveAllResultDialog.vue";
import { QVueGlobals } from "quasar";
import { Dispatch } from "@/store/vuex";

type QuasarDialog = QVueGlobals["dialog"];

export async function generateAndSaveOneAudioWithDialog({
  audioKey,
  quasarDialog,
  dispatch,
  filePath,
  encoding,
}: {
  audioKey: string;
  quasarDialog: QuasarDialog;
  dispatch: Dispatch<AllActions>;
  filePath?: string;
  encoding?: EncodingType;
}): Promise<void> {
  const result: SaveResultObject = await dispatch("GENERATE_AND_SAVE_AUDIO", {
    audioKey,
    filePath,
    encoding,
  });
  if (result.result === "SUCCESS" || result.result === "CANCELED") return;
  let msg = "";
  switch (result.result) {
    case "WRITE_ERROR":
      if (result.errorMessage) {
        msg = result.errorMessage;
      } else {
        msg = "由于一些原因导出失败。请查看日志。";
      }
      break;
    case "ENGINE_ERROR":
      msg = "由于引擎错误而失败。 请尝试重新启动引擎。";
      break;
  }
  quasarDialog({
    title: "导出失败。",
    message: msg,
    ok: {
      label: "关闭",
      flat: true,
      textColor: "secondary",
    },
  });
}

export async function generateAndSaveAllAudioWithDialog({
  quasarDialog,
  dispatch,
  dirPath,
  encoding,
}: {
  quasarDialog: QuasarDialog;
  dispatch: Dispatch<AllActions>;
  dirPath?: string;
  encoding?: EncodingType;
}): Promise<void> {
  const result = await dispatch("GENERATE_AND_SAVE_ALL_AUDIO", {
    dirPath,
    encoding,
  });
  const successArray: Array<string | undefined> = [];
  const writeErrorArray: Array<WriteErrorTypeForSaveAllResultDialog> = [];
  const engineErrorArray: Array<string | undefined> = [];
  if (result) {
    for (const item of result) {
      let msg = "";
      if (item.errorMessage) {
        msg = item.errorMessage;
      }

      let path = "";
      if (item.path) {
        path = item.path;
      }

      switch (item.result) {
        case "SUCCESS":
          successArray.push(path);
          break;
        case "WRITE_ERROR":
          writeErrorArray.push({ path: path, message: msg });
          break;
        case "ENGINE_ERROR":
          engineErrorArray.push(path);
          break;
      }
    }
  }

  if (writeErrorArray.length > 0 || engineErrorArray.length > 0) {
    quasarDialog({
      component: SaveAllResultDialog,
      componentProps: {
        successArray: successArray,
        writeErrorArray: writeErrorArray,
        engineErrorArray: engineErrorArray,
      },
    });
  }
}

export async function generateAndConnectAndSaveAudioWithDialog({
  quasarDialog,
  dispatch,
  filePath,
  encoding,
}: {
  quasarDialog: QuasarDialog;
  dispatch: Dispatch<AllActions>;
  filePath?: string;
  encoding?: EncodingType;
}): Promise<void> {
  const result = await dispatch("GENERATE_AND_CONNECT_AND_SAVE_AUDIO", {
    filePath,
    encoding,
  });

  if (
    result === undefined ||
    result.result === "SUCCESS" ||
    result.result === "CANCELED"
  )
    return;

  let msg = "";
  switch (result.result) {
    case "WRITE_ERROR":
      if (result.errorMessage) {
        msg = result.errorMessage;
      } else {
        msg = "由于一些原因导出失败。请查看日志。";
      }
      break;
    case "ENGINE_ERROR":
      msg = "由于引擎错误而失败。 请尝试重新启动引擎。";
      break;
  }

  quasarDialog({
    title: "导出失败。",
    message: msg,
    ok: {
      label: "关闭",
      flat: true,
      textColor: "secondary",
    },
  });
}

export async function connectAndExportTextWithDialog({
  quasarDialog,
  dispatch,
  filePath,
  encoding,
}: {
  quasarDialog: QuasarDialog;
  dispatch: Dispatch<AllActions>;
  filePath?: string;
  encoding?: EncodingType;
}): Promise<void> {
  const result = await dispatch("CONNECT_AND_EXPORT_TEXT", {
    filePath,
    encoding,
  });

  if (
    result === undefined ||
    result.result === "SUCCESS" ||
    result.result === "CANCELED"
  )
    return;

  let msg = "";
  switch (result.result) {
    case "WRITE_ERROR":
      msg = "由于导入错误而失败。请检查是否有空闲空间和写入许可。";
      break;
  }

  quasarDialog({
    title: "导出文本失败。",
    message: msg,
    ok: {
      label: "关闭",
      flat: true,
      textColor: "secondary",
    },
  });
}
