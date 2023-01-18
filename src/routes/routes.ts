import express from 'express';
const router = express.Router();

import * as usersController from '../controllers/users';
import * as propertiesController from '../controllers/properties';
import * as jobsController from '../controllers/jobs';
import { authorised, checkAuth } from '../middleware/authentication';

//Auth
router.get('/check-auth', checkAuth);

//Users
router.get('/all-users', usersController.getAllUsers);
router.post('/users/login', usersController.login);
router.post('/users', authorised, usersController.postUser);

//Properties
router.get('/properties/all-properties', authorised, propertiesController.getAllProperties);
router.get('/properties/:propertyid', authorised, propertiesController.getPropertyDetails);
router.post('/properties', authorised, propertiesController.postProperty);
router.put('/properties', authorised, propertiesController.editProperty);

//Jobs
router.get('/jobs/all-jobs', authorised, jobsController.getAllJobs);
router.get('/jobs/:jobid', authorised, jobsController.getJobDetails);

export default router;
