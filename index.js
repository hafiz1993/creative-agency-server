const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;

require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pnnmm.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;



const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('service'));
app.use(fileUpload());

const port= 4000;

app.get('/', (req, res) =>{
    res.send('mongodb')
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true  });
client.connect(err => {
  const serviceCollection = client.db("creative-agency-server").collection("services");
  const reviewsCollection = client.db("creative-agency-server").collection("reviews");
  const adminEmailsCollection = client.db("creative-agency-server").collection("admin-email");

  

  
  app.post('/addservice', (req, res) =>{

    const file = req.files.file;

    const name = req.body.name;
    const description = req.body.email;
    const newImg = file.data;
    const encImg = newImg.toString('base64');
    console.log(name,description, file );
    var image = {
      contentType:file.mimetype,
      size:file.size,
      img:Buffer.from(encImg, 'base64')
    };

    serviceCollection.insertOne({name, description, image})
    .then(result =>{
      res.send(result.insertedCount > 0);
    })

  })


app.get('/getServices', (req, res) =>{
  serviceCollection.find({})
  .toArray((err, documents) =>{
    res.send(documents)
  })
})



app.post('/addReview', (req, res) => { //---------------- user add Review
  reviewsCollection.insertOne(req.body)
      .then(result => {
          res.send(result.insertedCount > 0)
      })
})
app.get('/allReview', (req, res) => { //---------------- showing all user Review
  reviewsCollection.find({})
      .toArray((err, documents) => {
          res.send(documents)
      })
})

app.post('/addNewAdmin', (req, res) => { // ------------------ add New Admin
  adminEmailsCollection.insertOne(req.body)
      .then(result => {
          res.send(result.insertedCount > 0)
      })
})

app.get('/getAdminEmails', (req, res) => { //---------------- get all admin emails
  adminEmailsCollection.find({})
      .toArray((err, documents) => {
          res.send(documents)
      })
})

app.post('/checkAdminOrNot' , (req, res)=>{ //---------------- checking Who You Are - admin or not
  adminEmailsCollection.find({email: req.body.email})
      .toArray((err, documents) => {
          if(documents.length > 0){
              res.send({person: 'admin'})
          }else{
              res.send({person: 'user'})
          }
      })
})



});

app.listen(process.env.PORT || port)