const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uhbaknf.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const dbConnect = async () => {
  try {
    await client.connect();
  } catch (error) {
    console.error(error);
  }
};
dbConnect();

const serviceCollection = client.db("photography").collection("services");

app.get("/service", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);
    const query = {};
    const cursor = serviceCollection.find(query);
    const service = await cursor.limit(limit).toArray();
    res.send({
      status: true,
      message: "Data find successfully",
      data: service,
    });
  } catch (error) {
    console.error(error);
    res.send({
      status: false,
      message: error,
    });
  }
});

app.get("/services", async (req, res) => {
  try {
    const query = {};
    const cursor = serviceCollection.find(query);
    const services = await cursor.toArray();
    res.send({
      status: true,
      message: "Data find successfully",
      data: services,
    });
  } catch (error) {
    console.error(error);
    res.send({
      status: false,
      message: error,
    });
  }
});
app.get("/services/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const services = await serviceCollection.findOne(query);
    res.send({
      status: true,
      message: "Data find successfully",
      data: services,
    });
  } catch (error) {
    console.error(error);
    res.send({
      status: false,
      message: error,
    });
  }
});

// root api
app.get("/", (req, res) => {
  res.send("Photography King Server is Running");
});

app.listen(port, () => {
  console.log(`Photography King server is running on port ${port}`);
});
