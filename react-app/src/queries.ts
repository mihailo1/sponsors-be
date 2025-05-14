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
  return fetch(`${API_KEY}/api/upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: fileContent,
  }).then((response) => response.json());
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
