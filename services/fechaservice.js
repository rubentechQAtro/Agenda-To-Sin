import Fecha from '../models/fecha.js';

class FechaService {
  // Crear y validar fecha

  async crear(datosFecha) {
    const { fecha, banda, lugar, notas } = datosFecha;

    // 1. Ajuste de fecha pasada comparando solo el inicio del día actual
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (new Date(fecha) < hoy) {
      throw new Error('No puedes agendar un concierto en el pasado.');
    }

    const inicioDia = new Date(fecha);
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date(fecha);
    finDia.setHours(23, 59, 59, 999);

    // 2. Primero validamos idempotencia (evitar duplicados de la misma banda)
    const conciertoDuplicado = await Fecha.findOne({
      fecha: { $gte: inicioDia, $lte: finDia },
      banda: banda,
      lugar: lugar 
    });

    if (conciertoDuplicado) {
      throw new Error(`No se puede crear el evento, ya tienes un concierto con ${banda} en ${lugar} el ${fecha}.`);
    }

    // 3. Luego validamos choque de horarios con la otra banda
    const eventoExistente = await Fecha.findOne({
      fecha: { $gte: inicioDia, $lte: finDia }
    });

    if (eventoExistente) {
      const otraBanda = banda === 'FALL INTO SIN' ? 'SACRAMENT' : 'FALL INTO SIN';

      if (eventoExistente.lugar !== lugar) {
        throw new Error(`¡Conflicto de agenda! No puedes tocar con ${banda} aquí. Ese mismo día tienes el evento "${eventoExistente.titulo}" con ${otraBanda} en un lugar diferente (${eventoExistente.lugar}).`);
      }

      datosFecha.notas = `[FECHA COMPARTIDA] ¡Tus dos bandas tocan hoy en ${lugar}! ${notas || ''}`;
    }

    // 4. FALTABAN ESTAS LÍNEAS: Crear la instancia y guardarla en MongoDB Atlas
    const nuevaFecha = new Fecha(datosFecha);
    return await nuevaFecha.save();
  }

  // Obtener todas las fechas
  async obtenerTodas() {
    return await Fecha.find();
  }

  // Editar una fecha existente con protección de eventos confirmados (PUT completo)
  async editar(id, datosActualizados) {
    const { fecha, banda, lugar } = datosActualizados;
    const eventoActual = await Fecha.findById(id);

    if (!eventoActual) {
      throw new Error('El concierto que intentas editar no existe.');
    }

    // Si ya estaba cancelado en la BD, no se puede editar nada más
    if (eventoActual.estado === 'cancelada') {
      throw new Error('No puedes editar un concierto que ha sido cancelado.');
    }

    if (eventoActual.estado === 'confirmada') {
      const intentaCambiarFecha = fecha && new Date(fecha).getTime() !== new Date(eventoActual.fecha).getTime();
      const intentaCambiarLugar = lugar && lugar !== eventoActual.lugar;
      const intentaCambiarBanda = banda && banda !== eventoActual.banda;

      if (intentaCambiarFecha || intentaCambiarLugar || intentaCambiarBanda) {
        throw new Error(
          `¡Acción bloqueada! El evento "${eventoActual.titulo}" ya está CONFIRMADO. ` +
          'No puedes modificar la fecha, el lugar o la banda de un show confirmado de forma directa. ' +
          'Primero debes pasar el estado a "pendiente" o "cancelada" si deseas reprogramarlo.'
        );
      }
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fecha && new Date(fecha) < hoy) {
      throw new Error('No puedes cambiar un concierto a una fecha pasada.');
    }

    if (fecha || lugar) {
      const fechaABuscar = fecha ? new Date(fecha) : eventoActual.fecha;
      const lugarABuscar = lugar || eventoActual.lugar;
      const inicioDia = new Date(fechaABuscar);
      inicioDia.setHours(0, 0, 0, 0);
      const finDia = new Date(fechaABuscar);
      finDia.setHours(23, 59, 59, 999);

      const eventoExistente = await Fecha.findOne({
        _id: { $ne: id },
        fecha: { $gte: inicioDia, $lte: finDia }
      });

      if (eventoExistente) {
        const bandaActual = banda || eventoActual.banda;
        const otraBanda = bandaActual === 'FALL INTO SIN' ? 'SACRAMENT' : 'FALL INTO SIN';

        if (eventoExistente.lugar !== lugarABuscar) {
          throw new Error(`¡Conflicto de agenda, No puedes mover ${bandaActual} aquí. Ese mismo día tienes el concierto "${eventoExistente.titulo}" con ${otraBanda} en (${eventoExistente.lugar}).`);
        }

        datosActualizados.notas = `[FECHA COMPARTIDA] ¡Tus dos bandas tocan hoy en ${lugarABuscar}! ${datosActualizados.notas || ''}`;
      }
    }

    return await Fecha.findByIdAndUpdate(id, datosActualizados, { new: true, runValidators: true });
  }

  // Eliminar una fecha con validación de pasado
  async eliminar(id) {
    const evento = await Fecha.findById(id);
    if (!evento) {
      throw new Error('El concierto que intentas eliminar no existe.');
    }

    if (evento.estado === 'confirmada') {
      throw new Error('No puedes eliminar un concierto que ya ha sido confirmado.');
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (new Date(evento.fecha) < hoy) {
      throw new Error('No puedes eliminar un concierto que ya sucedió en el pasado.');
    }

    return await Fecha.findByIdAndDelete(id);
  }

  // Actualizar de forma parcial (PATCH rápido)
  async actualizar(id, datosActualizados) {
    const evento = await Fecha.findById(id);
    if (!evento) {
      throw new Error('El concierto que intentas actualizar no existe.');
    }

    // Corrección: Solo bloquea si ya estaba cancelado en la BD
    if (evento.estado === 'cancelada') {
      throw new Error('No puedes actualizar un concierto que ya ha sido cancelado.');
    }

    if (evento.estado === 'confirmada') {
      const { fecha, lugar, banda } = datosActualizados;
      
      const cambiaFecha = fecha && new Date(fecha).getTime() !== new Date(evento.fecha).getTime();
      const cambiaLugar = lugar && lugar !== evento.lugar;
      const cambiaBanda = banda && banda !== evento.banda;

      if (cambiaFecha || cambiaLugar || cambiaBanda) {
        throw new Error('No puedes modificar la fecha, el lugar o la banda de un concierto que ya ha sido confirmado de forma directa.');
      }
    }

    // Reutilizamos la lógica de choque si el PATCH intenta mover fechas o lugares de forma alternativa
    if (datosActualizados.fecha || datosActualizados.lugar) {
      return await this.editar(id, { ...evento._doc, ...datosActualizados });
    }

    return await Fecha.findByIdAndUpdate(id, datosActualizados, { new: true, runValidators: true });
  }
}

export default new FechaService();
