import express from 'express';
const router = express.Router();
import { fileUpload } from '../middleware/multer';

import * as usersController from '../controllers/users';
import * as filesController from '../controllers/files';
import * as dashboardsController from '../controllers/dashboards';
import * as propertiesController from '../controllers/properties';
import * as jobsController from '../controllers/jobs';
import * as schedulesController from '../controllers/schedules';
import * as assetsController from '../controllers/assets';
import * as sparesController from '../controllers/spares';
import * as enumsController from '../controllers/enums';
import * as permissionsController from '../controllers/permissions';
import * as jobTypesController from '../controllers/jobTypes';
import * as statusTypesController from '../controllers/statusTypes';
import * as urgencyTypesController from '../controllers/urgencyTypes';
import { authorised, checkAuth } from '../middleware/authentication';

// Auth
router.get('/check-auth', checkAuth);

// Files
router.get('/getfile/:fileid', filesController.getFile);
router.get('/files/:model/:id', authorised, filesController.getFilesForModel);
router.post('/file', authorised, fileUpload.array('files'), filesController.postFile);
router.delete('/file/:id', authorised, filesController.deleteFile);

// Users
router.get('/all-users', usersController.getAllUsers); // should this route be controlled???
router.get('/users/all/:propertyid', authorised, usersController.getAllUsersForProperty);
router.get('/users/byuserid/:userid', authorised, usersController.getUserById);
router.post('/users/login', usersController.login);
router.post('/users', authorised, usersController.postUser);
router.delete('/users/:id', authorised, usersController.deleteUser);

// User Groups
router.get('/usergroups/all', authorised, usersController.getAllUserGroups);
router.put('/usergroups', authorised, usersController.addEditUserGroup);
router.delete('/usergroups/:id', authorised, usersController.deleteUserGroup);

// Permissions
router.get('/permissions/group/:groupid', authorised, permissionsController.getAllPermissionsForGroup);
router.put('/permissions/group/:groupid', authorised, permissionsController.setPermissionsForGroup);

// Dashboard
router.get('/dashboard/jobs/:propertyid', authorised, dashboardsController.getDashboardJobs)

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
router.get('/jobs/create-job', authorised, jobsController.getEnumsForCreateJob);
router.get('/jobs/:jobid', authorised, jobsController.getJobDetails);
router.get('/jobs/update/:propertyid/:jobid', authorised, jobsController.getJobUpdate);
router.post('/jobs', authorised, jobsController.postJob);
router.put('/jobs/update', authorised, fileUpload.array('files'), jobsController.updateAndComplete);
router.put('/jobs/notes', authorised, jobsController.updateNotes);

// Schedule Templates
router.get('/schedule-templates/all-schedules/:propertyid', authorised, schedulesController.getAllScheduleTemplates);
router.get('/schedule-templates/:propertyid/:templateid', authorised, schedulesController.getScheduleTemplate);

// Schedules
router.get('/schedules/:scheduleid', authorised, schedulesController.getSchedulePMDetails);
router.post('/schedules', authorised, schedulesController.addSchedule);

// Assets
router.get('/asset-tree/:propertyid', authorised, assetsController.getAssetTree);
router.get('/asset/:assetid', authorised, assetsController.getAsset);
router.post('/asset', authorised, assetsController.insertAsset);
router.delete('/asset/:id', authorised, assetsController.deleteAsset);

// Spares
router.get('/all-spares/:propertyid', authorised, sparesController.getallSpares);
router.get('/spare/:spareid/:propertyid', authorised, sparesController.getSpare);
router.get('/spares-for-use/:propertyid', authorised, sparesController.getSparesForUse);
router.get('/spares/instock/:spareid', authorised, sparesController.getSpareStock);
router.put('/spares/add-edit', authorised, sparesController.addEditSpare);
router.put('/spares/adjust-stock', authorised, sparesController.adjustSpareStock);
router.delete('/spares/item/:id', authorised, sparesController.deleteSparesItem);
//// Spares Suppliers
router.get('/spares/suppliers/:propertyid', authorised, sparesController.getSuppliers);
router.get('/spares/supplier/:supplierid', authorised, sparesController.getSuplierInfo);
router.put('/spares/supplier', authorised, sparesController.addEditSupplier);
router.delete('/spares/supplier/:id', authorised, sparesController.deleteSupplier);
//// Spares Deliveries
router.get('/spares/deliveries/:propertyid/:deliveryid', authorised, sparesController.getDeliveries);
router.put('/spares/delivery/add-edit', authorised, sparesController.addEditDelivery);
router.delete('/spares/delivery/:id', authorised, sparesController.deleteDelivery);
//// Spares Warnings
router.get('/spares/warnings/:propertyid', authorised, sparesController.getSparesWarnings);
//// Spares Notes
router.get('/spares/notes/:propertyid', authorised, sparesController.getSparesNotes);
router.get('/spares/note/:noteid', authorised, sparesController.getNote);
router.put('/spares/notes', authorised, sparesController.postNote);
router.delete('/spares/note/:id', authorised, sparesController.deleteNote);

// Enums
router.get('/enumgroups', authorised, enumsController.getEnumsGroups);
router.get('/enumgroup/:id', authorised, enumsController.getEnumsGroupById);
router.get('/enumgroups/:id', authorised, enumsController.getEnumsByGroupId);
router.put('/enumgroups', authorised, enumsController.addEditEnumGroup);
router.delete('/enumgroups/:id', authorised, enumsController.deleteEnumGroup);
router.get('/enumvalue/:id', authorised, enumsController.getEnumValueById);
router.put('/enumvalues', authorised, enumsController.addEditEnumValue);
router.delete('/enumvalues/:id', authorised, enumsController.deleteEnumValue);

// Job Types
router.get('/jobtypes', authorised, jobTypesController.getJobTypes);
router.get('/jobtypes/:id', authorised, jobTypesController.getJobTypeById);
router.put('/jobtypes', authorised, jobTypesController.addEditJobType);
router.delete('/jobtypes/:id', authorised, jobTypesController.deleteJobType);

// Job Status Types
router.get('/statustypes', authorised, statusTypesController.getStatusTypes);
router.get('/statustypes/:id', authorised, statusTypesController.getStatusTypeById);
router.put('/statustypes', authorised, statusTypesController.addEditStatusType);
router.delete('/statustypes/:id', authorised, statusTypesController.deleteStatusType);

// Job Urgency Types
router.get('/urgencytypes', authorised, urgencyTypesController.getUrgencyTypes);
router.get('/urgencytypes/:id', authorised, urgencyTypesController.getUrgencyTypeById);
router.put('/urgencytypes', authorised, urgencyTypesController.addEditUrgencyType);
router.delete('/urgencytypes/:id', authorised, urgencyTypesController.deleteUrgencyType);

export default router;
