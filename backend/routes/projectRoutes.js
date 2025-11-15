import express from 'express';

import { createProject, addMembers, updateProject } from '../controllers/projectController.js';

const projectRouter = express.Router();

projectRouter.post('/', createProject)
projectRouter.put('/', updateProject)
projectRouter.post('/:projectId/addMember', addMembers)

export default projectRouter;