const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port =process.env.PORT || 5000;



app.use(express.json());
app.use(cors())




const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tiivm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run () {
  try{
    await client.connect();
    const bikeCollection = client.db("bikeItems").collection("bikes");
    console.log('connected');
    // read all data
    app.get('/bikes',async(req,res)=>{
      const q = req.query;
      const coursor = bikeCollection.find(q);
      const result =await coursor.toArray();
      res.send(result);
    });

    // read a data by id
    app.get('/bikes/:id',(req,res)=>{
      const id = req.params.id;
      const find = {_id:ObjectId(id)};
      const bike = bikeCollection.findOne(find)
      res.send(bike)
    });

    
  }
  finally{
    // await client.close();
  }
}
run().catch(console.dir)

app.get('/',(req,res) =>{
    res.send('Hi, I am your awesome server')
})

app.listen(port,()=>{
    console.log(`server running ${port}`);
})