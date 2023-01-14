import express from'express';
const router = express.Router();


import * as usersController from '../controllers/users';
import * as jobsController from '../controllers/jobs'
import { authorised, checkAuth } from '../middleware/authentication';

//Auth
router.get('/check-auth', checkAuth)

//Users
router.get('/all-users', usersController.getAllUsers)
router.post('/users/login', usersController.login)

//Jobs
router.get('/jobs/all-jobs',authorised, jobsController.getAllJobs)

export default router;