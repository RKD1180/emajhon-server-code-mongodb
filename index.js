const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qzrcz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("online_shop");
    const productCollection = database.collection("products");
    const ordersCollenction = database.collection("orders");

    // get products api
    app.get("/products", async (req, res) => {
      // console.log(req.query);
      const curosr = productCollection.find({});
      const page = req.query.page;
      const size = parseInt(req.query.size);
      const count = await curosr.count();

      let products;

      if (page) {
        products = await curosr
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        products = await curosr.toArray();
      }
      res.send({
        count,
        products,
      });
    });

    // get data by keys
    app.post("/products/bykeys", async (req, res) => {
      // console.log(req.body);
      // res.send("hitting data");
      const keys = req.body;
      const query = { key: { $in: keys } };
      const products = await productCollection.find(query).toArray();

      res.json(products);
    });

    //  add orders api
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await ordersCollenction.insertOne(order);

      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Ema jon server is runnig");
});

app.listen(port, () => {
  console.log("Server is Runnig at Port: ", port);
});
