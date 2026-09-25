#!/usr/bin/env bash
# Builds dist/index.html for the hosted Claude Artifact version of the blog.
# The Artifact host adds its own <html>/<head>/<body> wrapper, so those tags
# (plus head-only meta/icon lines) are stripped from index.html here.
# Assets are published alongside it from assets/ unchanged.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p dist
sed -e '/<!DOCTYPE html>/d' \
    -e '/^<html/d' -e '/^<\/html>/d' \
    -e '/^<head>/d' -e '/^<\/head>/d' \
    -e '/^<body>/d' -e '/^<\/body>/d' \
    -e '/<meta /d' -e '/rel="icon"/d' -e '/rel="canonical"/d' \
    index.html > dist/index.html
echo "built dist/index.html ($(wc -c < dist/index.html) bytes)"
