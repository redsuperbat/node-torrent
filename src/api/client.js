const client = {
  post: (url, payload, headers) => fetchMethod(url, "POST", payload, headers),
  get: (url, payload, headers) => fetchMethod(url, "GET", payload, headers),
  patch: (url, payload, headers) => fetchMethod(url, "PATCH", payload, headers),
  delete: (url, payload, headers) =>
    fetchMethod(url, "DELETE", payload, headers),
};

const fetchMethod = async (url, method, payload, headers) => {
  const token = localStorage.getItem("token");
  return fetch(url, {
    method: method,
    headers: {
      "content-type": "application/json",
      authorization: token || "",
      ...headers,
    },
    body: JSON.stringify(payload),
  });
};

export default client;
