For Client (React frontend)

Install ESLint + Prettier + React plugins:

npm i -D eslint prettier @eslint/js globals eslint-plugin-react-hooks eslint-plugin-react-refresh

✅ For Server (Node backend)

Install only ESLint + Prettier:

npm i -D eslint prettier

📌 Add these scripts inside package.json
"scripts": {
  "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
  "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
  "format": "prettier --write ."
}


in serve 

npm run lint

> task-app-server@1.0.0 lint
> eslint . --ext .js,.jsx,.ts,.tsx

manmohan@manu-201:~/Documents/aws/todo/server$ npm run format

> task-app-server@1.0.0 format
> prettier --write .

.prettierrc 70ms (unchanged)
controllers/taskController.js 74ms (unchanged)
dockerCmd.md 55ms
eslint.config.js 9ms (unchanged)
models/Task.js 10ms (unchanged)
package-lock.json 115ms (unchanged)
package.json 6ms (unchanged)
routes/tasks.js 12ms (unchanged)
server.js 41ms (unchanged)
manmohan@manu-201:~/Documents/aws/todo/server$ 