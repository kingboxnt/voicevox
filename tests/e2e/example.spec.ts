import { test } from "@playwright/test";
import { testWithPlaywright } from "vue-cli-plugin-electron-builder";
import dotenv from "dotenv";

test("起動したら「关于使用条款」が表示される", async () => {
  dotenv.config(); // FIXME: エンジンの設定直読み
  const { app, stop } = await testWithPlaywright();
  const sut = await app.firstWindow();

  // エンジンが起動し「关于使用条款」が表示されるのを待つ
  await sut.waitForSelector("text=关于使用条款");

  await stop();
});
