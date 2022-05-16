import { app } from "./test-setup";

export default async function teardown() {
  console.log("APP CLOSED");
  await app.close();
}