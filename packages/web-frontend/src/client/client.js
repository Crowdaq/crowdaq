import BackendClient from "./backend_client"

const BACKEND_URL = process.env.VUE_APP_CROWDAQ_API_URL || 'https://api.crowdaq.com/apiV2';

export default process.env.NODE_ENV === 'development' ?
    new BackendClient("http://127.0.0.1:4000/apiV2") : // Development server
    new BackendClient(BACKEND_URL);
