const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config()
const {
  MongoClient,
  ServerApiVersion,
  ObjectId
} = require('mongodb');
const res = require('express/lib/response');
const port = process.env.PORT || 5000;



app.use(express.json());
app.use(cors())

const verifyJWT =(req,res,next) =>{
  const authHeader = req.headers.authorization;
  // console.log(authHeader);
  if(!authHeader){
    return res.status(401).send({message: "Unauthorized Access"})
  };
  const token = authHeader.split(' ')[1]
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(error,decoded)=>{
    if(error){
      return res.status(403).send({message: "Forbidden Access"});
    }
    req.decoded = decoded;
    next()
  })
};


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tiivm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1
});
async function run() {
  try {
    await client.connect();
    const productCollection = client.db("bikeItems").collection("bikes");
    console.log('connected');
    app.post('/login',(req,res)=>{
      const user = req.body;
      console.log(user);
      const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: '1d'
      });
      res.send(accessToken);
    })
    // read all data
    app.get('/products', async (req, res) => {
      const q = req.query;
      const coursor = productCollection.find(q);
      const result = await coursor.toArray();
      res.send(result);
    });
    // get products by Email addrress 
    app.get('/myitems',verifyJWT,async (req, res) => {
      const userEmail = req.query;
      const decodedEmail = req.decoded.email;
      console.log(decodedEmail);
      console.log(userEmail);
      if(userEmail.email == decodedEmail){
        const coursor = productCollection.find(userEmail);
        const result = await coursor.toArray();
        res.send(result);
      }else{
        res.status(403).send({message: 'forbidden access'})
      };
    });
    // read a data by id
    // http://localhost:5000/bikes/626c843b9e3c0e5df2c06ce9
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const find = {
        _id: ObjectId(id)
      };
      const result = await productCollection.findOne(find)
      res.send(result)
    });
    // post data 
    app.post('/product', async (req, res) => {
      const data = req.body;
      const result = await productCollection.insertOne(data)
      res.send(result);
    });

    //  Update data using id 
    // http://localhost:5000/bike/626c843b9e3c0e5df2c06ce9
    app.put('/product/:id', async (req, res) => {
      const id = req.params.id;
      const currentQuantity = req.body.newQuantity;
      const filter = {
        _id: ObjectId(id)
      };
      const options = {
        upsert: true
      };
      const updateDoc = {

        $set: {
          quantity: currentQuantity
        },
      };
      const result = await productCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // Delete a data using id
    app.delete('/product/:id', async (req, res) => {
      const id = req.params.id;
      const filter = {
        _id: ObjectId(id)
      }
      const result = await productCollection.deleteOne(filter)
      res.send(result)
    })

  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hi, I am your awesome server');
});

app.listen(port, () => {
  console.log(`server running ${port}`);
});