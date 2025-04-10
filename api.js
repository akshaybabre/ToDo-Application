const express = require('express');
const cors = require('cors');
const mongoClient = require('mongodb').MongoClient;

const dbServer = 'mongodb://127.0.0.1:27017';

const app = express();
app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.get('/users',async (req,res) => {
  try {
    const client = await mongoClient.connect(dbServer);
    const db = client.db('todo');
    const users = await db.collection('users').find({}).toArray();
    res.send(users);
    client.close();
  } catch (error) {
    console.log(error);
    res.status(500).send({error:'Failed to fetch users'});
  }
});

app.get('/appointments', async (req,res) => {
  try {
    const client = await mongoClient.connect(dbServer);
    const db = client.db('todo');
    const appointments = await db.collection('appointments').find({}).toArray();
    res.send(appointments);
    client.close();
  } catch (error) {
    res.status(500).send({error:'Failed to fetch appointments'});
  }
});

app.get('/appointments/:id',async (req,res) => {
  try {
    const client = await mongoClient.connect(dbServer);
    const db = client.db('todo');
    const appointment = await db.collection('appointments').findOne({id:parseInt(req.params.id)});
    res.send(appointment);
    client.close();
  } catch (error) {
    res.status(500).send({error:'Failed to fetch appointment'});
  }
});

app.post('/register-user', async (req,res) => {
  try {
    const client = await mongoClient.connect(dbServer);
    const db = client.db('todo');
    var User = {
      username:req.body.username,
      email:req.body.email,
      password:req.body.password
    }
    await db.collection('users').insertOne(User);
    console.log('User is added...');
    res.send({ message: 'Success' });
    client.close();
  } catch (error) {
    res.status(500).send({error:'Failed to add user'});
  }
});

app.post('/add-appointment', async (req,res) => {
  try {
    const client =await mongoClient.connect(dbServer);
    const db = client.db('todo');
    var Appointment = {
      id:parseInt(req.body.id),
      title:req.body.title,
      description:req.body.description,
      date:req.body.date,
      username:req.body.username
    };
    await db.collection('appointments').insertOne(Appointment);
    console.log('Appointment is added...');
    res.send({ message: 'Appointment added' });
    client.close();
  } catch (error) {
    res.status(500).send({error:'Failed to add appointment'});
  }
});

app.put('/edit-appointment/:id', async (req,res) => {
  try {
    const client = await mongoClient.connect(dbServer);
    const db = client.db('todo');
    var EditAppointment = {
      id:parseInt(req.body.id),
      title:req.body.title,
      description:req.body.description,
      date:req.body.date,
      username:req.body.username
    };
    await db.collection('appointments').updateOne({id:parseInt(req.params.id)},{$set:EditAppointment});
    console.log('Appointment is Updated');
    res.send({ message: 'Success' });
    client.close();
  } catch (error) {
    res.status(500).send({error:'Failed to update appointment'});
  }
});

app.delete('/delete-appointment/:id', async (req,res) => {
  try {
    const client = await mongoClient.connect(dbServer);
    const db = client.db('todo');
    await db.collection('appointments').deleteOne({id:parseInt(req.params.id)});
    console.log('Appointment is deleted');
    res.send({ message: 'Success' });
    client.close();
  } catch (error) {
    res.status(500).send({error:"Failed to delete appointment"});
  }
});

app.delete('/users/:username', async (req,res) => {
  try {
    const client = await mongoClient.connect(dbServer);
    const db = client.db('todo');
    await db.collection('users').deleteOne({username:req.params.username});
    console.log('User is deleted');
    res.send({ message: 'User deleted' });
    client.close();
  } catch (error) {
    res.status(500).send({error:"Failed to delete user"});
  }
});

const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(4050);
console.log('Server is Started : http://localhost:4050');
