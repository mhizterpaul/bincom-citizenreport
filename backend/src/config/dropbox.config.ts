import { Dropbox } from "dropbox";
import dotenv from "dotenv";

dotenv.config();
const accessToken = process.env.DROPBOX_ACCESS_TOKEN;

// Function to make JSON safe for HTTP headers
const httpHeaderSafeJson = (v: any) => {
  return JSON.stringify(v).replace(/[\u007f-\uffff]/g, (c) => {
    return "\\u" + ("000" + c.charCodeAt(0).toString(16)).slice(-4);
  });
};

// Create a custom fetch function that adds the authorization header
const customFetch = (url: string, options: any) => {
  if (!accessToken) {
    throw new Error(
      "Dropbox access token is not configured. Please set DROPBOX_ACCESS_TOKEN in your .env file"
    );
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  };

  // Add specific headers for different operations
  if (options.method === "POST") {
    if (url.includes("/files/upload")) {
      // For file uploads, the path is in the options object
      const path =
        options.path || `/Apps/citizen-report/uploads/${Date.now()}.png`;
      headers["Dropbox-API-Arg"] = httpHeaderSafeJson({
        path,
        mode: { ".tag": "add" },
        autorename: true,
        mute: false,
        strict_conflict: false,
      });
      headers["Content-Type"] = "application/octet-stream";
    } else if (url.includes("/sharing/create_shared_link_with_settings")) {
      headers["Content-Type"] = "application/json";
    }
  }

  return fetch(url, { ...options, headers });
};

// Create the Dropbox client with our custom fetch
export const dropbox = new Dropbox({
  accessToken,
  fetch: customFetch,
});
