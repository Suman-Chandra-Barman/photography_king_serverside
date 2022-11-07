const express = require("express");
const cors = require("cors");
const app = express();

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// root api
app.get("/", (req, res) => {
  res.send("Photography King Server is Running");
});

app.listen(port, () => {
  console.log(`Photography King server is running on port ${port}`);
});
