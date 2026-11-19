import 'dotenv/config'; // variables de entorno  
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import fechaRoutes from './routes/fechaRoutes.js'; 

const app = express();

//  nube o local
const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
}));

// Middleware para leer JSON
app.use(express.json());

// Enrutar peticiones
app.use('/api/fechas', fechaRoutes);

// Conexión inteligente a Mongo
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agenda_bandas';

mongoose.connect(MONGO_URI)
  .then(() => {
    // nube
    const destino = process.env.MONGO_URI ? 'Atlas (Nube)' : 'Localhost';
    console.log(`Conectado con éxito a MongoDB en: [${destino}]`);
  })
  .catch((err) => console.error('Error al conectar a MongoDB:', err));

// Servidor
app.listen(PORT, () => {
  console.log(` Servidor escuchando en banda ${PORT}`);
});
