import ApiClient from "./api-client";

const client = new ApiClient({ baseUrl: "https://yts.mx/api/v2/", cors: true });

export default client;
