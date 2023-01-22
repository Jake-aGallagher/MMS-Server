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
router.get('/properties/:propertyid/assigned-users', authorised, propertiesController.getAssignedUsers);
router.get('/properties/:propertyid/users-for-assigning', authorised, propertiesController.getUsersForAssign);
router.get('/properties/last-property/:userid', propertiesController.getLastProperty);
router.post('/properties', authorised, propertiesController.postProperty);
router.put('/properties', authorised, propertiesController.editProperty);
router.put('/properties/assign-users', authorised, propertiesController.setAssignedUsers);
router.put('/properties/Last-property', propertiesController.setLastProperty);

//Jobs
router.get('/jobs/all-jobs', authorised, jobsController.getAllJobs);
router.get('/jobs/:jobid', authorised, jobsController.getJobDetails);

export default router;
