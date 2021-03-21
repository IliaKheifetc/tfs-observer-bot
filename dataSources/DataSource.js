const fetch = require("node-fetch");

class DataSource {
  constructor({ baseUrl, headers }) {
    this.baseUrl = baseUrl;
    this.headers = headers;
  }

  async request({ url, method, body, headers = {} }) {
    const defaultOptions = {
      method,
      headers: { ...this.headers, ...headers },
    };

    console.log({ url });

    const response = await fetch(
      this.baseUrl ? `${this.baseUrl}${url}` : url,
      method === "POST"
        ? { ...defaultOptions, body: JSON.stringify(body) }
        : defaultOptions
    );
    return await response.json();
  }

  get(url, headers = {}) {
    try {
      return this.request({ url, method: "GET" });
    } catch (e) {
      console.log("error occurred when GETting data: ", e);
    }
  }

  post(url, body, headers = {}) {
    try {
      return this.request({ url, method: "POST", body });
    } catch (e) {
      console.log("error occurred when POSTing data: ", e);
    }
  }
}

module.exports = DataSource;
