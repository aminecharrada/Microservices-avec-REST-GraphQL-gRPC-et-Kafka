const { Kafka } = require('kafkajs');

// Configuration Kafka
const kafka = new Kafka({
  clientId: 'movie-service',
  brokers: ['localhost:9092']
});

// Consumer (ajouter après la définition du service)
const consumer = kafka.consumer({ groupId: 'movie-group' });

const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'movies_topic' });
  await consumer.run({
    eachMessage: async ({ message }) => {
      console.log('Message reçu:', JSON.parse(message.value.toString()));
    },
  });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const { action, movie } = JSON.parse(message.value.toString());
        console.log(`[${action}] Movie received:`, movie);
        
        // Traitement supplémentaire ici
        // Ex: mettre à jour une base de données, notifier d'autres services, etc.
      } catch (err) {
        console.error('Error processing message:', err);
      }
    },
  });
};
// Démarrer le consumer
runConsumer().catch(err => {
    console.error('Kafka consumer error:', err);
    process.exit(1);
  });
runConsumer().catch(console.error);
// movieMicroservice.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
// Charger le fichier movie.proto
const movieProtoPath = 'movie.proto';
const movieProtoDefinition = protoLoader.loadSync(movieProtoPath, {
keepCase: true,
longs: String,
enums: String,
defaults: true,
oneofs: true,
});
const movieProto = grpc.loadPackageDefinition(movieProtoDefinition).movie;
// Implémenter le service movie
const movieService = {
getMovie: (call, callback) => {
// Récupérer les détails du film à partir de la base de données
const movie = {
id: call.request.movie_id,
title: 'Exemple de film',
description: 'Ceci est un exemple de film.',
// Ajouter d'autres champs de données pour le film au besoin
};
callback(null, { movie });
},
searchMovies: (call, callback) => {
const { query } = call.request;
// Effectuer une recherche de films en fonction de la requête
const movies = [
{
id: '1',
title: 'Exemple de film 1',
description: 'Ceci est le premier exemple de film.',
},
{
id: '2',
title: 'Exemple de film 2',
description: 'Ceci est le deuxième exemple de film.',
},
// Ajouter d'autres résultats de recherche de films au besoin
];
callback(null, { movies });
},
createMovie: (call, callback) => {
    const newMovie = {
      id: Date.now().toString(),
      title: call.request.title,
      description: call.request.description
    };
    // Add database save logic here if needed
    callback(null, { movie: newMovie });
  }
// Ajouter d'autres méthodes au besoin
};
// Créer et démarrer le serveur gRPC
const server = new grpc.Server();
server.addService(movieProto.MovieService.service, movieService);
const port = 50051;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(),
(err, port) => {
if (err) {
console.error('Échec de la liaison du serveur:', err);
return;
}
console.log(`Le serveur s'exécute sur le port ${port}`);
server.start();
});
console.log(`Microservice de films en cours d'exécution sur le port ${port}`);

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/streaming', { useNewUrlParser: true });

const movieSchema = new mongoose.Schema({
  title: String,
  description: String
});

const Movie = mongoose.model('Movie', movieSchema);