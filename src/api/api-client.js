const defaultHeaders = {
  "content-type": "application/json",
};

class ApiClient {
  constructor({ baseUrl, cors } = {}) {
    this.baseUrl = baseUrl;
    this.cors = cors;
  }

  async post(url, { params, headers, body } = {}) {
    const response = await this._fetchMethod(url, "POST", {
      params,
      headers,
      body,
    });
    return this._parseJson(response);
  }
  async get(url, { params, headers, body } = {}) {
    const response = await this._fetchMethod(url, "GET", {
      params,
      headers,
      body,
    });
    return this._parseJson(response);
  }
  async patch(url, { params, headers, body } = {}) {
    const response = await this._fetchMethod(url, "PATCH", {
      params,
      headers,
      body,
    });
    return this._parseJson(response);
  }
  async delete(url, { params, headers, body } = {}) {
    const response = await this._fetchMethod(url, "DELETE", {
      params,
      headers,
      body,
    });
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

  _fetchMethod(url, method, { body, headers, params }) {
    const token = localStorage.getItem("token");
    if (params) {
      params = Object.entries(params)
        .map((p) => `${p[0]}=${p[1]}`)
        .join("&");
    }
    const requestUrl = `${this.baseUrl || ""}${url}?${params || ""}`;
    console.log(requestUrl);

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
      body: JSON.stringify(body),
      mode: this.cors && "cors",
    });
  }
}

export default ApiClient;
