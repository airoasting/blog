#!/usr/bin/env node
// posts-index.json → assets/js/posts-data.js 동기화
// 사용법: node sync-posts.js

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'posts-index.json');
const DEST = path.join(__dirname, 'assets', 'js', 'posts-data.js');

const json = fs.readFileSync(SRC, 'utf-8');
JSON.parse(json); // validate

fs.writeFileSync(DEST, 'window.POSTS_DATA = ' + json.trimEnd() + ';\n', 'utf-8');
console.log('✔ posts-data.js synced from posts-index.json');
