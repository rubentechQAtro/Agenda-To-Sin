import mongoose from "mongoose";

const fechaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'Nombre del evento es obligatorio '],
    trim: true,
  },
  fecha: {
    type: Date,
    required: [true, 'Fecha del evento es obligatoria'],
  },
  lugar: {
    type: String,
    default: 'Lugar no especificado',
  },
  banda: {
    type: String,
    required: [true, 'Nombre de la banda es obligatorio'],
    enum: ['FALL INTO SIN', 'SACRAMENT', 'AMBOS'], // bandas 
  },  
  
  horaPresentacion: {
    type: String,
    required: [true, 'La hora de presentación es obligatoria'],
    match: [/^(\d|2[0-3]):[0-5]\d$/, 'El formato de hora debe ser HH:MM (24 horas)']
  },
  
  tiempoTarima: {
    type: Number,
    required: [true, 'El tiempo en tarima es obligatorio'],
    min: [15, 'El tiempo mínimo en tarima son 15 minutos']
  },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmada', 'cancelada'],
    default: 'pendiente', 
  },
  
  notas: {
    type: String,
    default: '',
  },

  backline: {
    type: String,
    default: 'Backline no especificado',
  },

}, {
  //siempre en un objeto aparte
  timestamps: true
});

export default mongoose.model('fecha', fechaSchema);
