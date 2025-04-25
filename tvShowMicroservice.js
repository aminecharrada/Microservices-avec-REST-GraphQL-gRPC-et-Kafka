    // tvShowMicroservice.js
    const grpc = require('@grpc/grpc-js');
    const protoLoader = require('@grpc/proto-loader');
    // Charger le fichier tvShow.proto
    const tvShowProtoPath = 'tvShow.proto';
    const tvShowProtoDefinition = protoLoader.loadSync(tvShowProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    });
    const tvShowProto = grpc.loadPackageDefinition(tvShowProtoDefinition).tvShow;
    // Implémenter le service de séries TV
    const tvShowService = {
        getTvshow: async (call, callback) => {
            try {
                const show = await TVShow.findById(call.request.tv_show_id);
                callback(null, { tv_show: show });
            } catch(err) {
                callback(err);
            }
        },

        searchTvshows: async (call, callback) => {
            try {
                const shows = await TVShow.find({});
                callback(null, { tv_shows: shows });
            } catch(err) {
                callback(err); 
            }
        },

        createTvShow: async (call, callback) => {
            try {
                const show = new TVShow({
                    title: call.request.title,
                    description: call.request.description
                });
                await show.save();
                callback(null, { tv_show: show });
            } catch(err) {
                callback(err);
            }
        }
    };
    // Créer et démarrer le serveur gRPC
    const server = new grpc.Server();
    server.addService(tvShowProto.TVShowService.service, tvShowService);
    const port = 50052;
    server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(),
    (err, port) => {
    if (err) {
    console.error('Échec de la liaison du serveur:', err);
    return;
    }
    console.log(`Le serveur s'exécute sur le port ${port}`);
    server.start();
    });
    console.log(`Microservice de séries TV en cours d'exécution sur le port
    ${port}`);

    const mongoose = require('mongoose');

    // Connexion MongoDB
    mongoose.connect('mongodb://localhost:27017/streaming', { useNewUrlParser: true });

    // Schéma TV Show
    const tvShowSchema = new mongoose.Schema({
        title: String, 
        description: String
    });

    const TVShow = mongoose.model('TVShow', tvShowSchema);

    // Modifier le service TV Show pour utiliser MongoDB
