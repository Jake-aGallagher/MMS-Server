import express from 'express';
const router = express.Router();

import * as usersController from '../controllers/users';
import * as propertiesController from '../controllers/properties';
import * as jobsController from '../controllers/jobs';
import * as assetsController from '../controllers/assets';
import * as sparesController from '../controllers/spares';
import * as enumsController from '../controllers/enums';
import { authorised, checkAuth } from '../middleware/authentication';

// Auth
router.get('/check-auth', checkAuth);

// Users
router.get('/all-users', usersController.getAllUsers);
router.post('/users/login', usersController.login);
router.post('/users', authorised, usersController.postUser);

// Properties
router.get('/properties/all-properties', authorised, propertiesController.getAllProperties);
router.get('/properties/:propertyid', authorised, propertiesController.getPropertyDetails);
router.put('/properties', authorised, propertiesController.addEditProperty);
//// Property Users
router.get('/properties/assigned-users/:propertyid', authorised, propertiesController.getAssignedUsers);
router.get('/properties/users-for-assigning/:propertyid', authorised, propertiesController.getUsersForAssign);
router.put('/properties/assign-users', authorised, propertiesController.setAssignedUsers);
//// Last Property
router.get('/properties/last-property/:userid', propertiesController.getLastProperty);
router.put('/properties/Last-property', authorised, propertiesController.setLastProperty);

// Jobs
router.get('/jobs/all-jobs/:propertyid', authorised, jobsController.getAllJobs);
router.get('/jobs/:jobid', authorised, jobsController.getJobDetails);
router.get('/jobs/update/:propertyid/:jobid', authorised, jobsController.getJobUpdate);
router.post('/jobs', authorised, jobsController.postJob);
router.put('/jobs/update', authorised, jobsController.updateAndComplete);
router.put('/jobs/notes', authorised, jobsController.updateNotes);

// Assets
router.get('/asset-tree/:propertyid', authorised, assetsController.getAssetTree);
router.get('/asset/:assetid', authorised, assetsController.getAsset);
router.post('/asset', authorised, assetsController.insertAsset);
router.put('/asset', authorised, assetsController.renameAsset);
router.put('/asset/notes', authorised, assetsController.EditAssetNote)
router.delete('/asset', authorised, assetsController.deleteAsset);

// Spares
router.get('/all-spares/:propertyid', authorised, sparesController.getallSpares);
router.get('/spares/:spareid', authorised, sparesController.getSpare);
router.get('/spares-for-use/:propertyid/:jobId', authorised, sparesController.getSparesForUse);
router.put('/spares/add-edit', authorised, sparesController.addEditSpare);
router.put('/spares/adjust-stock', authorised, sparesController.adjustSpareStock);
router.delete('/spares/spares-item', authorised, sparesController.deleteSparesItem);
//// Spares Suppliers
router.get('/spares/suppliers/:propertyid', authorised, sparesController.getSuppliers);
router.get('/spares/supplier/:supplierid', authorised, sparesController.getSuplierInfo);
router.put('/spares/supplier', authorised, sparesController.addEditSupplier);
router.delete('/spares/supplier', authorised, sparesController.deleteSupplier);
//// Spares Warnings
router.get('/spares/warnings/:propertyid', authorised, sparesController.getSparesWarnings);
//// Spares Notes
router.get('/spares/notes/:propertyid', authorised, sparesController.getSparesNotes);
router.get('/spares/note/:noteid', authorised, sparesController.getNote);
router.put('/spares/notes', authorised, sparesController.postNote);
router.delete('/spares/note', authorised, sparesController.deleteNote);

// Enums
router.get('/enums/create-job', enumsController.getEnumsForCreateJob);

export default router;
