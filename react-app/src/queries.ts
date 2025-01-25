export const fetchStats = () => {
  return fetch(`${process.env.REACT_APP_API_BASE_URL}/api/stats`).then((response) => response.json());
};

export const uploadFile = (fileContent: string | ArrayBuffer | null) => {
  return fetch(`${process.env.REACT_APP_API_BASE_URL}/api/upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: fileContent,
  }).then((response) => response.json());
};

export const fetchStrings = (query: string) => {
  return fetch(`${process.env.REACT_APP_API_BASE_URL}/api/strings/search?query=${query}`).then((response) => response.json());
};

export const deleteString = (id: number) => {
  return fetch(`${process.env.REACT_APP_API_BASE_URL}/api/strings/${id}`, {
    method: "DELETE",
  }).then((response) => response.json());
};

export const addString = (value: string) => {
  return fetch(`${process.env.REACT_APP_API_BASE_URL}/api/strings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ value }),
  }).then((response) => response.json());
};

export const fetchApiSchema = () => {
  return fetch(`${process.env.REACT_APP_API_BASE_URL}/api/schema`).then((response) => response.json());
};
