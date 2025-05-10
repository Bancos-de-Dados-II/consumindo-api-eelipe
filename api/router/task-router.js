import express from 'express'
const TaskRouter = express.Router();
import { getTasks, createTask, findTask, deleteTask, updateTask } from '../controller/task-controller.js';

TaskRouter.get('/', getTasks);
TaskRouter.get('/:id',findTask);
TaskRouter.delete('/:id', deleteTask);
TaskRouter.post('/', createTask);
TaskRouter.patch('/:id', updateTask);

export default TaskRouter;