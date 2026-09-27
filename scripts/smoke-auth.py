#!/usr/bin/env python3
"""Test the running production server without printing credentials or cookies."""
import http.cookiejar
import json
import os
import urllib.error
import urllib.request

base = os.environ.get('SMOKE_BASE_URL', 'http://127.0.0.1:3187').rstrip('/')
password = os.environ['PASSWORD']


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args):
        return None


def request(client, path, data=None):
    req = urllib.request.Request(
        base + path,
        data=json.dumps(data).encode() if data is not None else None,
        headers={'Content-Type': 'application/json'},
    )
    try:
        return client.open(req, timeout=30)
    except urllib.error.HTTPError as error:
        return error


anonymous = urllib.request.build_opener(NoRedirect)
r = request(anonymous, '/')
assert r.code == 307 and '/login' in r.headers.get('Location', ''), r.code
print('PASS: anonymous home redirects to login')
r = request(anonymous, '/api/search?q=test')
assert r.code == 401, r.code
print('PASS: anonymous search is denied')
r = request(anonymous, '/api/login', {'password': password + '-incorrect'})
assert r.code == 401, r.code
print('PASS: wrong password is rejected')
client = urllib.request.build_opener(
    NoRedirect, urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar())
)
r = request(client, '/api/login', {'password': password})
assert r.code == 200, r.code
r = request(client, '/')
assert r.code == 200 and 'JoyFlix' in r.read().decode(), r.code
print('PASS: correct password opens home')
r = request(anonymous, '/login')
assert r.code == 200, r.code
print('PASS: login page is accessible')
