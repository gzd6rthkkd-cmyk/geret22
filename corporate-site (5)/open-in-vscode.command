#!/bin/bash
cd "$(dirname "$0")"
code . index.html || echo "VS Code не знайдено: https://code.visualstudio.com"
