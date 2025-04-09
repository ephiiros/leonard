# leonard

## Local 
- clone repo 
- get this (v0.26.6) https://github.com/pocketbase/pocketbase/releases
- file strucutre is 
- db next to src, pocketbase in there
```
.
├── db
│   ├── CHANGELOG.md
│   ├── LICENSE.md
│   ├── pb_data
│   ├── pb_migrations
│   └── pocketbase
├── node_modules/
├── src/
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json
```
- make bot on discord
- fill env
- invite bot to server with perms: 
  - todo: which perms!
- inside db/: `./pocketbase serve`
- inside project root: 
```
npm install
npm run dev
```

## Docs
goodluck