const defaultHeaders = {
  "content-type": "application/json",
};

class ApiClient {
  constructor({ baseUrl, cors } = {}) {
    this.baseUrl = baseUrl;
    this.cors = cors;
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
    const requestUrl = `${this.baseUrl || ""}${url}`;

    let finalHeaders = {};
    if (!this.cors) {
      finalHeaders = {
        authorization: token || "",
        ...defaultHeaders,
        ...headers,
      };
    }

    return fetch(requestUrl, {
      method: method,
      headers: finalHeaders,
      body: JSON.stringify(payload),
      mode: this.cors && "cors",
    });
  }
}

export default ApiClient;
