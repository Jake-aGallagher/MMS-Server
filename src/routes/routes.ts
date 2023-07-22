import express from 'express';
const router = express.Router();
import { fileUpload } from '../middleware/multer';

import * as usersController from '../controllers/users';
import * as propertiesController from '../controllers/properties';
import * as jobsController from '../controllers/jobs';
import * as assetsController from '../controllers/assets';
import * as sparesController from '../controllers/spares';
import * as enumsController from '../controllers/enums';
import * as permissionsController from '../controllers/permissions';
import { authorised, checkAuth } from '../middleware/authentication';

// Auth
router.get('/check-auth', checkAuth);

// Users
router.get('/all-users', usersController.getAllUsers);
router.get('/users/all/:propertyid', authorised, usersController.getAllUsersForProperty);
router.get('/users/byuserid/:userid', authorised, usersController.getUserById);
router.post('/users/login', usersController.login);
router.post('/users', authorised, usersController.postUser);

// User Groups
router.get('/usergroups/all', authorised, usersController.getAllUserGroups);
router.put('/usergroups', authorised, usersController.addEditUserGroup);

// Permissions
router.get('/permissions/group/:groupid', authorised, permissionsController.getAllPermissionsForGroup)
router.put('/permissions/group/:groupid', authorised, permissionsController.setPermissionsForGroup)

// Properties
router.get('/properties/all-properties', authorised, propertiesController.getAllProperties);
router.get('/properties/:propertyid', authorised, propertiesController.getPropertyDetails);
router.put('/properties', authorised, propertiesController.addEditProperty);
//// Property Users
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
router.put('/jobs/update', authorised, fileUpload.array('files'), jobsController.updateAndComplete);
router.put('/jobs/notes', authorised, jobsController.updateNotes);

// Assets
router.get('/asset-tree/:propertyid', authorised, assetsController.getAssetTree);
router.get('/asset/:assetid', authorised, assetsController.getAsset);
router.post('/asset', authorised, assetsController.insertAsset);
router.delete('/asset', authorised, assetsController.deleteAsset);

// Spares
router.get('/all-spares/:propertyid', authorised, sparesController.getallSpares);
router.get('/spare/:spareid/:propertyid', authorised, sparesController.getSpare);
router.get('/spares-for-use/:propertyid', authorised, sparesController.getSparesForUse);
router.put('/spares/add-edit', authorised, sparesController.addEditSpare);
router.put('/spares/adjust-stock', authorised, sparesController.adjustSpareStock);
router.delete('/spares/spares-item', authorised, sparesController.deleteSparesItem);
//// Spares Suppliers
router.get('/spares/suppliers/:propertyid', authorised, sparesController.getSuppliers);
router.get('/spares/supplier/:supplierid', authorised, sparesController.getSuplierInfo);
router.put('/spares/supplier', authorised, sparesController.addEditSupplier);
router.delete('/spares/supplier', authorised, sparesController.deleteSupplier);
//// Spares Deliveries
router.get('/spares/deliveries/:propertyid/:deliveryid', authorised, sparesController.getDeliveries);
router.put('/spares/delivery/add-edit', authorised, sparesController.addEditDelivery);
router.delete('/spares/delivery', authorised, sparesController.deleteDelivery);
//// Spares Warnings
router.get('/spares/warnings/:propertyid', authorised, sparesController.getSparesWarnings);
//// Spares Notes
router.get('/spares/notes/:propertyid', authorised, sparesController.getSparesNotes);
router.get('/spares/note/:noteid', authorised, sparesController.getNote);
router.put('/spares/notes', authorised, sparesController.postNote);
router.delete('/spares/note', authorised, sparesController.deleteNote);

// Enums
router.get('/enums/create-job', authorised, enumsController.getEnumsForCreateJob);
router.get('/enums/typesvalues', authorised, enumsController.getEnumsForSettings);
router.get('/enums/types', authorised, enumsController.getEnumTypesForEdit);
router.get('/enums/edit/:id', authorised, enumsController.getEnumForEdit);
router.put('/enums', authorised, enumsController.addEditEnum);
router.delete('/enum', authorised, enumsController.deleteEnum);

export default router;
