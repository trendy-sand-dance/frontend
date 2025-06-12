#!/bin/bash

echo "creating self-signed SSl certificates"

openssl	req \
		-x509 \
		-nodes \
		-days 365 \
		-newkey rsa:2048 \
		-subj "/C=NL/ST=Holland/L=Amsterdam/O=Codam/CN=${WEBSITE}" \
		-out "./setup/server.crt" \
		-keyout "./setup/server.key"
