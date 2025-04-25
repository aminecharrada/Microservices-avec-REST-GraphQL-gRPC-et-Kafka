// apiGateway.js
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require ('@apollo/server/express4');
const bodyParser = require('body-parser');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
// Charger les fichiers proto pour les films et les séries TV
const movieProtoPath = 'movie.proto';
const tvShowProtoPath = 'tvShow.proto';
const resolvers = require('./resolvers');
const typeDefs = require('./schema');
const { Kafka } = require('kafkajs');

// Configuration Kafka 
const kafka = new Kafka({
  clientId: 'api-gateway',
  brokers: ['localhost:9092']
});
const producer = kafka.producer();
// Créer une nouvelle application Express
const app = express();
const movieProtoDefinition = protoLoader.loadSync(movieProtoPath, {
keepCase: true,
longs: String,
enums: String,
defaults: true,
oneofs: true,
});
const tvShowProtoDefinition = protoLoader.loadSync(tvShowProtoPath, {
keepCase: true,
longs: String,
enums: String,
defaults: true,
oneofs: true,
});
// Add these middleware BEFORE your routes
app.use(bodyParser.json()); // For parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
const movieProto = grpc.loadPackageDefinition(movieProtoDefinition).movie;
const tvShowProto = grpc.loadPackageDefinition(tvShowProtoDefinition).tvShow;
// Créer une instance ApolloServer avec le schéma et les résolveurs importés
const server = new ApolloServer({ typeDefs, resolvers });
// Appliquer le middleware ApolloServer à l'application Express
server.start().then(() => {
app.use(
cors(),
bodyParser.json(),
expressMiddleware(server),
);
});
app.get('/movies', (req, res) => {
    const client = new movieProto.MovieService('localhost:50051',
    grpc.credentials.createInsecure());
    client.searchMovies({}, (err, response) => {
    if (err) {
    res.status(500).send(err);
    } else {
    res.json(response.movies);
    }
    });
    });
    app.get('/movies/:id', (req, res) => {
    const client = new movieProto.MovieService('localhost:50051',
    grpc.credentials.createInsecure());
    const id = req.params.id;
    client.getMovie({ movieId: id }, (err, response) => {
    if (err) {
    res.status(500).send(err);
    } else {
    res.json(response.movie);
    }
    });
    });
    app.get('/tvshows', (req, res) => {
    const client = new tvShowProto.TVShowService('localhost:50052',
    grpc.credentials.createInsecure());
    client.searchTvshows({}, (err, response) => {
    if (err) {
    res.status(500).send(err);
    } else {
    res.json(response.tv_shows);
    }
    });
    });
    app.get('/tvshows/:id', (req, res) => {
    const client = new tvShowProto.TVShowService('localhost:50052',
    grpc.credentials.createInsecure());
    const id = req.params.id;
    client.getTvshow({ tvShowId: id }, (err, response) => {
    if (err) {
    res.status(500).send(err);
    } else {
    res.json(response.tv_show);
    }
    });
    });
    app.post('/movies', async (req, res) => {
        console.log('Received body:', req.body);
        try {
          const client = new movieProto.MovieService(
            'localhost:50051',
            grpc.credentials.createInsecure()
          );
      
          // Envoi à gRPC
          client.createMovie({
            title: req.body.title,
            description: req.body.description
          }, async (err, response) => {
            if (err) {
              console.error('gRPC error:', err);
              return res.status(500).json({ error: err.message });
            }
      
            // Envoi à Kafka
            await producer.connect();
            await producer.send({
              topic: 'movies_topic',
              messages: [{
                value: JSON.stringify({
                  action: 'created',
                  movie: {
                    title: req.body.title, 
                    description: req.body.description || '' 
                  }
                })
              }]
            });
            await producer.disconnect();
      
            res.status(201).json(response.movie);
          });
        } catch (err) {
          console.error('Error:', err);
          res.status(500).json({ error: 'Internal server error' });
        }
      });
    // Démarrer l'application Express
    const port = 3000;
    app.listen(port, () => {
    console.log(`API Gateway en cours d'exécution sur le port ${port}`);
    });