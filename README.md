# TP7 - Architecture Microservices avec Node.js


## 🏗 Architecture du Projet

L'architecture comprend quatre composants principaux :

1. **API Gateway** (Port 3000)
   - Point d'entrée unique
   - Supporte REST et GraphQL
   - Route les requêtes aux microservices

2. **Microservice Films** (Port 50051)
   - Gestion CRUD des films
   - Communication gRPC
   - Consommateur Kafka

3. **Microservice Séries TV** (Port 50052)
   - Gestion CRUD des séries
   - Communication gRPC
   - Consommateur Kafka

4. **Kafka** (Port 9092)
   - Producteur dans l'API Gateway
   - Topics: `movies_topic` et `tvshows_topic`


## 🚀 Installation

```bash

# Installer les dépendances
npm install

# Démarrer les services (dans des terminaux séparés)
npm run start:kafka    # Kafka + Zookeeper
npm run start:movies   # Microservice Films (port 50051)
npm run start:tv       # Microservice Séries (port 50052)
npm run start:gateway  # API Gateway (port 3000)
```

## 🎯 Utilisation

### API REST
```bash
# Créer un film
curl -X POST http://localhost:3000/movies \
  -H "Content-Type: application/json" \
  -d '{"title":"Inception","description":"Film de science-fiction"}'

# Lister les films
curl http://localhost:3000/movies
```

### API GraphQL
```graphql
# Mutation GraphQL (à exécuter sur http://localhost:3000/graphql)
mutation {
  createMovie(title: "The Matrix", description: "Monde virtuel") {
    id
    title
  }
}
```

## ✅ Vérification des Exigences

### 1. Vérifier gRPC
```bash
# Vérifier que les services écoutent
lsof -i :50051 # Films
lsof -i :50052 # Séries
```

### 2. Vérifier Kafka
```bash
# Consulter les messages
kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic movies_topic --from-beginning
```

### 3. Vérifier MongoDB
```bash
# Se connecter à MongoDB
mongo
> use streaming
> db.movies.find()
```

## 📂 Structure du Projet

```
tp7-microservices/
├── proto/
│   ├── movie.proto       # Définition du service Films
│   └── tvShow.proto      # Définition du service Séries
├── apiGateway.js         # Point d'entrée principal
├── movieMicroservice.js  # Implémentation gRPC Films
├── tvShowMicroservice.js # Implémentation gRPC Séries
├── resolvers.js          # Résolveurs GraphQL
├── schema.js            # Schéma GraphQL
└── package.json         # Dépendances et scripts
```

## Implémentation

### API Gateway (REST + Kafka)
```javascript
// apiGateway.js
app.post('/movies', async (req, res) => {
  const movie = await grpcClient.createMovie(req.body);
  
  await kafkaProducer.send({
    topic: 'movies_topic',
    messages: [{ value: JSON.stringify(movie) }]
  });
  
  res.status(201).json(movie);
});
```

### Microservice Films (gRPC + MongoDB)
```javascript
// movieMicroservice.js
createMovie: (call, callback) => {
  const movie = new Movie({
    title: call.request.title,
    description: call.request.description
  });
  
  movie.save((err, savedMovie) => {
    callback(err, { movie: savedMovie });
  });
}



Rest test capture
![image](https://github.com/user-attachments/assets/0395e942-12b8-4664-bf86-ac5fbb345340)


graphql test capture 
![image](https://github.com/user-attachments/assets/9dfe0a34-285c-4251-b96a-130ebd401f55)


grpc test capture
![image](https://github.com/user-attachments/assets/80fea930-3295-4397-9235-88c5090d0086)

capture msg test consumer producer 
![image](https://github.com/user-attachments/assets/23aa6b73-859a-42de-9a33-8dc1cd4e2459)


