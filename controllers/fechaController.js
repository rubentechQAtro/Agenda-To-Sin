import fechaservice from "../services/fechaservice.js";

class FechaController {
  async crear(req, res) {
    try {
      const nuevaFecha = await fechaservice.crear(req.body);
      return res.status(201).json(nuevaFecha);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async obtenerTodas(req, res) {
    try {
      const fechas = await fechaservice.obtenerTodas();
      return res.status(200).json(fechas);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      await fechaservice.eliminar(id);
      return res.status(200).json({ message: "Concierto eliminado con éxito" });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  // Método para el PUT (Edición completa)
  async editar(req, res) {
    try {
      const { id } = req.params;
      const datosActualizados = req.body;
      const resultado = await fechaservice.editar(id, datosActualizados);
      return res.status(200).json({ message: "Concierto editado con éxito", data: resultado });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  //  Cambiado a 'actualizar' y llamando a fechaservice.actualizar (PATCH parcial)
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const datosActualizados = req.body;
      const resultado = await fechaservice.actualizar(id, datosActualizados);
      return res.status(200).json({ message: "Concierto actualizado con éxito", data: resultado });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export default new FechaController();
