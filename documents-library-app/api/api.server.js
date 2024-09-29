/* const path = require('path');
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router(path.join(_dirname, 'db.json'));

server.use(jsonServer.bodyParser);
server.use(router);

server.use((req, res, next) => {
  if (req.method === ('POST' || 'PATCH' || 'DELETE' || 'PUT')) {
    req.body.createdAt = Date.now();
  }
  // Continue to JSON Server router
  next()
})

server.listen(3000, function () {
    console.log('JSON Server is running on port 3000....')
}) */