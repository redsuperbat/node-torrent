const client = {
  post: (url, payload, headers) =>
    fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...headers,
      },
      body: JSON.stringify(payload),
    }),
  get: (url, payload, headers) =>
    fetch(url, {
      headers: {
        "content-type": "application/json",
        ...headers,
      },
    }),
};

export default client;
