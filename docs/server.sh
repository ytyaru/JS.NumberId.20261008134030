#!/usr/bin/env bash
set -Ceu
#---------------------------------------------------------------------------
# HTTPローカルサーバを起動する
# https://qiita.com/00b012deb7c8/items/6d4e93ac10de24cf7c79
# https://qiita.com/relu/items/3461753e3886072349c7
# https://www.lifewithpython.com/2021/03/python-https-server.html
#---------------------------------------------------------------------------
Run() {
	THIS="$(realpath "${BASH_SOURCE:-0}")"; HERE="$(dirname "$THIS")"; PARENT="$(dirname "$HERE")"; THIS_NAME="$(basename "$THIS")"; APP_ROOT="$PARENT";
	cd "$HERE"
	PEM=cert.pem
	SERVER=run_server.py
	makePem() {
#		openssl req -x509 -new -days 365 -nodes \
#		  -keyout $PEM \
#		  -out localhost.pem \
#		  -subj "/CN=localhost"
		openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"
	}
	Http() {
		PORT=8000
		URL="http://0.0.0.0:$PORT/"
		chromium-browser $URL
		python3 -m http.server $PORT
	}
	Https() {
		[ ! -f "./$PEM" ] && makePem || :
		URL="https://localhost:8000/"
		firefox "$URL"
#		chromium-browser $URL
		sudo python3 $SERVER
	}
	Https
}
Run "$@"
