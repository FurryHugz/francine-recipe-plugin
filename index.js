const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// A simple endpoint to test the server
app.get('/', (req, res) => {
  res.send("Francine’s Recipe Plugin is running!");
});

// For now, no real endpoints for recipes are here.
// We'll add them later.

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
