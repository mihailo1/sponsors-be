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

export const uploadFile = async (fileContent: File | string | ArrayBuffer | null) => {
  let jsonArray: unknown = [];
  try {
    if (fileContent instanceof File) {
      const text = await fileContent.text();
      jsonArray = JSON.parse(text);
    } else if (typeof fileContent === "string") {
      jsonArray = JSON.parse(fileContent);
    } else if (fileContent instanceof ArrayBuffer) {
      const text = new TextDecoder().decode(fileContent);
      jsonArray = JSON.parse(text);
    } else {
      throw new Error("No file content provided");
    }
  } catch (e) {
    throw new Error("Uploaded file is not valid JSON");
  }
  if (!Array.isArray(jsonArray)) {
    throw new Error("Uploaded JSON must be an array");
  }
  return fetch(`${API_KEY}/api/upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jsonArray),
  }).then(async (response) => {
    const contentType = response.headers.get("content-type");
    if (response.ok) {
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      } else {
        return response.text();
      }
    } else {
      let error;
      if (contentType && contentType.includes("application/json")) {
        error = await response.json();
        throw new Error(typeof error === 'object' ? JSON.stringify(error) : String(error));
      } else {
        error = await response.text();
        throw new Error(error);
      }
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
