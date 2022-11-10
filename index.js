const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
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

// jwt token verify
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
};

// connect with database
const dbConnect = async () => {
  try {
    await client.connect();
  } catch (error) {
    console.error(error);
  }
};
dbConnect();

// server and collection create
const serviceCollection = client.db("photography").collection("services");
const reviewCollection = client.db("photography").collection("reviews");

// get api
app.get("/service", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);
    const total = parseInt(req.query.total);

    const query = {};
    const cursor = serviceCollection.find(query);
    const service = await cursor
      .skip(total - limit)
      .limit(limit)
      .toArray();
    const count = await serviceCollection.estimatedDocumentCount();
    res.send({
      status: true,
      message: "Data find successfully",
      total: count,
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

app.get("/review", async (req, res) => {
  try {
    const name = req.query.name;
    const query = { name: { $in: [name] } };
    const cursor = reviewCollection.find(query);
    const review = await cursor.toArray();
    res.send({
      status: true,
      message: "Data find successfully",
      data: review,
    });
  } catch (error) {
    console.error(error);
    res.send({
      status: false,
      message: error,
    });
  }
});

app.get("/my-review", verifyJWT, async (req, res) => {
  try {
    const email = req.query.email;
    const query = { email: { $in: [email] } };
    const cursor = reviewCollection.find(query);
    const review = await cursor.toArray();
    res.send({
      status: true,
      message: "Data find successfully",
      data: review,
    });
  } catch (error) {
    console.error(error);
    res.send({
      status: false,
      message: error,
    });
  }
});

// post api

app.post("/review", async (req, res) => {
  const order = req.body;
  const result = await reviewCollection.insertOne(order);
  res.send(result);
});

app.post("/services", async (req, res) => {
  const service = req.body;
  const result = await serviceCollection.insertOne(service);
  res.send(result);
});

// create access token key
app.post("/jwt", (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.TOKEN_KEY, {
    expiresIn: "2 days",
  });
  res.send({ token });
});

// update api
app.patch("/my-review/:id", async (req, res) => {
  const id = req.params.id;
  const updateData = req.body.updateMessage;
  const query = { _id: ObjectId(id) };
  const updateDoc = {
    $set: {
      message: updateData,
    },
  };
  const result = await reviewCollection.updateOne(query, updateDoc);
  res.send(result);
});

// delete collection
app.delete("/my-review/:id", verifyJWT, async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const result = await reviewCollection.deleteOne(query);
  res.send(result);
});

// root api
app.get("/", (req, res) => {
  res.send("Photography King Server is Running");
});

app.listen(port, () => {
  console.log(`Photography King server is running on port ${port}`);
});
