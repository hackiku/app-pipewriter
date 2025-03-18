// $lib/iframe/utils.ts

import { writable } from "svelte/store";

export const isProcessing = writable(false);

export async function callGAS(
  action: string,
  params: Record<string, any>,
): Promise<any> {
  isProcessing.set(true);
  const message = { action, params };

  return new Promise((resolve, reject) => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "gasResponse") {
        window.removeEventListener("message", handleMessage);
        isProcessing.set(false);
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data.result);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    window.parent.postMessage(JSON.stringify(message), "*");

    // Set a timeout to reject the promise if no response is received
    setTimeout(() => {
      window.removeEventListener("message", handleMessage);
      isProcessing.set(false);
      reject(new Error("GAS call timed out"));
    }, 30000); // 30 seconds timeout
  });
}
