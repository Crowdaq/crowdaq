import requests
import json


class CrowdaqClient(object):
    def __init__(self, endpoint):
        self.endpoint = endpoint
        self.token = ""

    def login(self, username, password):
        resp = self.make_request("login", {
            "username": username,
            "password": password
        })

        if resp.status_code == 200:
            self.token = json.loads(resp.content.decode('utf-8'))['token']
        else:
            print("Login failed")

    def make_request(self, fn, args):

        headers = {
            "content-type": "application/json"
        }

        if self.token != "":
            headers['authorization'] = f"Bearer {self.token}"

        return requests.post(self.endpoint, json={
            "fn": fn,
            "args": args,
        }, headers=headers)


client = CrowdaqClient("http://127.0.0.1:4000/apiV2")
client.login("test_user", "password")
