import { Router } from "express";
import fechaController from "../controllers/fechaController.js";

const router = Router();

//  http://localhost:5000/api/fechas
router.get('/', fechaController.obtenerTodas);

//  http://localhost:5000/api/fechas
router.post('/', fechaController.crear);

//  http://localhost:5000/api/fechas/:id
router.delete('/:id', fechaController.eliminar);

//  http://localhost:5000/api/fechas/:id

router.put('/:id', fechaController.editar);

//  http://localhost:5000/api/fechas/actualizar/:id
// actualizar cambios parciales rápidos (cancelar o mover estados)
//ingresar solo el campo a editar para que no lance error 
router.patch('/actualizar/:id', fechaController.actualizar);

export default router;
