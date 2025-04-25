# TP7 - Microservices avec Node.js

Ce projet est une démonstration de l'architecture microservices utilisant Node.js, gRPC, GraphQL, et Kafka.

## 🚀 Architecture du Projet

Le projet est composé de plusieurs composants :
- API Gateway
- Microservice Films
- Microservice Séries TV
- Producteur Kafka
- Consommateur Kafka

### Structure du Projet
```
├── apiGateway.js          # Point d'entrée principal et API Gateway
├── movieMicroservice.js   # Service de gestion des films
├── tvShowMicroservice.js  # Service de gestion des séries TV
├── movie.proto           # Définition du service gRPC pour les films
├── tvShow.proto         # Définition du service gRPC pour les séries
├── schema.js           # Schéma GraphQL
├── resolvers.js        # Résolveurs GraphQL
├── producteur.js      # Producteur de messages Kafka
└── consommateur.js    # Consommateur de messages Kafka
```

## 🛠 Technologies Utilisées

- **Node.js** : Plateforme d'exécution
- **Express** : Framework web
- **gRPC** : Communication entre services
- **GraphQL** : API Query Language
- **Kafka** : Messagerie événementielle
- **MongoDB** : Base de données NoSQL

API Gateway 
Features:

REST endpoints (/movies, /tvshows)

GraphQL support

gRPC client integration  

// apiGateway.js
app.post('/movies', async (req, res) => {
  // 1. Call gRPC service
  const grpcResponse = await client.createMovie(req.body);
  
  // 2. Publish to Kafka
  await kafkaProducer.send({
    topic: 'movies_topic',
    messages: [{ value: JSON.stringify(grpcResponse) }]
  });
  
  res.status(201).json(grpcResponse);
});
GraphQL Implementation (Completed)
Schema:

graphql
type Mutation {
  createMovie(title: String!, description: String): Movie
  createTVShow(title: String!, description: String): TVShow
}
Resolver:

javascript
// resolvers.js
Mutation: {
  createMovie: (_, args) => {
    return grpcClient.createMovie(args); // gRPC call
  }
}
4. Kafka Integration (Completed)
Producer (API Gateway):

javascript
const producer = kafka.producer();
await producer.send({
  topic: 'movies_topic',
  messages: [{ value: JSON.stringify(message) }]
});
Consumer (Microservice):

javascript
// movieMicroservice.js
await consumer.run({
  eachMessage: async ({ message }) => {
    console.log('Received:', JSON.parse(message.value));
  }
});
5. Database Connection (Completed)
javascript
// movieMicroservice.js
mongoose.connect('mongodb://localhost:27017/streaming');
const Movie = mongoose.model('Movie', new Schema({
  title: String,
  description: String
}));
🛠️ How to Verify All Requirements
Start Services
bash
# Terminal 1:
node movieMicroservice.js

# Terminal 2: 
node tvShowMicroservice.js

# Terminal 3:
node apiGateway.js
Test Endpoints
1. REST API Test

bash
curl -X POST http://localhost:3000/movies \
  -H "Content-Type: application/json" \
  -d '{"title":"Inception","description":"Sci-fi"}'
2. GraphQL Test

graphql
mutation {
  createMovie(title: "Matrix", description: "Virtual reality") {
    id
    title
  }
}

Rest test capture
![image](https://github.com/user-attachments/assets/0395e942-12b8-4664-bf86-ac5fbb345340)


graphql test capture 
![image](https://github.com/user-attachments/assets/9dfe0a34-285c-4251-b96a-130ebd401f55)


grpc test capture
![image](https://github.com/user-attachments/assets/80fea930-3295-4397-9235-88c5090d0086)

capture msg test consumer producer 
![image](https://github.com/user-attachments/assets/23aa6b73-859a-42de-9a33-8dc1cd4e2459)


