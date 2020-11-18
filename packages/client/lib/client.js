'use strict';

const axios = require("axios");

class Client{
    constructor(endpoint="/apiV2") {
        this.endpoint = endpoint;
        this.axios = axios.create({
            headers: {
                "content-type": "application/json"
            },
            withCredentials: true
        });
    }

    async login(username, password){
        const resp = await this.makeRequest("login", {
            username, password
        });
        this.token = resp.data.token;
    }

    async makeRequest(fn, args){
        const ret = await this.axios.post(this.endpoint, {
                fn, args
            },{
                headers:{
                    "authorization": `Bearer ${this.token}`,
                    "content-type": "application/json"
                }
            }
        );
        return ret;
    }
}

module.exports = Client;
