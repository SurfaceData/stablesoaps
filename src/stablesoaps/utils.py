import os
import requests


def download(source, destination):
    print(source)
    print(destination)
    return
    if os.path.exists(destination):
        return
    res = requests.get(source)
    if res.status_code != 200:
        return
    with open(destination, "wb") as f:
        f.write(res.content)
