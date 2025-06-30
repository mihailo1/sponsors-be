const API_KEY = process.env.REACT_APP_API_BASE_URL ??
  globalThis.location.origin;

console.log("API_KEY", {
  API_KEY,
  process: process.env,
  window: globalThis.location.origin,
  REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
});

export const fetchStats = () => {
  return fetch(`${API_KEY}/api/stats`).then((response) => response.json());
};

export const uploadFile = (fileContent: string | ArrayBuffer | null) => {
  // Ensure fileContent is a string (e.g., base64 or text)
  const fileString = typeof fileContent === "string" ? fileContent : '';
  return fetch(`${API_KEY}/api/upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ file: fileString }),
  }).then(async (response) => {
    const contentType = response.headers.get("content-type");
    if (response.ok) {
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      } else {
        return response.text();
      }
    } else {
      // Try to parse error as JSON, otherwise return text
      let error;
      if (contentType && contentType.includes("application/json")) {
        error = await response.json();
      } else {
        error = await response.text();
      }
      throw new Error(error);
    }
  });
};

export const fetchStrings = (query: string) => {
  return fetch(`${API_KEY}/api/strings/search?query=${query}`).then((
    response,
  ) => response.json());
};

export const deleteString = (id: number) => {
  return fetch(`${API_KEY}/api/strings/${id}`, {
    method: "DELETE",
  }).then((response) => response.json());
};

export const addString = (value: string) => {
  return fetch(`${API_KEY}/api/strings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ value }),
  }).then((response) => response.json());
};

export const fetchApiSchema = () => {
  return fetch(`${API_KEY}/api/schema`).then((response) => response.json());
};
