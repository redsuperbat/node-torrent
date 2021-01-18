class ApiClient {
  constructor({ baseUrl } = {}) {
    this.baseUrl = baseUrl;
  }

  async post(url, payload, headers) {
    const response = await this._fetchMethod(url, "POST", payload, headers);
    return this._parseJson(response);
  }
  async get(url, payload, headers) {
    const response = await this._fetchMethod(url, "GET", payload, headers);
    return this._parseJson(response);
  }
  async patch(url, payload, headers) {
    const response = await this._fetchMethod(url, "PATCH", payload, headers);
    return this._parseJson(response);
  }
  async delete(url, payload, headers) {
    const response = await this._fetchMethod(url, "DELETE", payload, headers);
    return this._parseJson(response);
  }

  async _parseJson(response) {
    if (response.status > 399)
      return Promise.reject(
        new Error({ message: response.statusText, response })
      );
    const data = await response.json();
    const { statusText, status, headers } = response;
    return { data, headers, statusText, status };
  }

  _fetchMethod(url, method, payload, headers) {
    const token = localStorage.getItem("token");
    return fetch(this.baseUrl || "" + url, {
      method: method,
      headers: {
        "content-type": "application/json",
        authorization: token || "",
        ...headers,
      },
      body: JSON.stringify(payload),
    });
  }
}

export default ApiClient;
