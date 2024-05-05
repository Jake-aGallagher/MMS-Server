import express from 'express';
const router = express.Router();
import { fileUpload } from '../middleware/multer';
import { authorised, checkAuth } from '../middleware/authentication';

import * as usersController from '../controllers/users';
import * as filesController from '../controllers/files';
import * as dashboardsController from '../controllers/dashboards';
import * as revenueController from '../controllers/revenue';
import * as facilitiesController from '../controllers/facilities';
import * as jobsController from '../controllers/jobs';
import * as PmsController from '../controllers/pms';
import * as logsController from '../controllers/logs';
import * as assetsController from '../controllers/assets';
import * as sparesController from '../controllers/spares';
import * as enumsController from '../controllers/enums';
import * as permissionsController from '../controllers/permissions';
import * as taskTypesController from '../controllers/jobTypes';
import * as statusTypesController from '../controllers/statusTypes';
import * as urgencyTypesController from '../controllers/urgencyTypes';
import * as customFieldsController from '../controllers/customFields';

// Auth
router.get('/check-auth', checkAuth);

// Files
router.get('/getfile/:fileid', filesController.getFile);
router.get('/getimage/:imageid', filesController.getImage);
router.get('/files/:model/:id', authorised, filesController.getFilesForModel);
router.post('/file', authorised, fileUpload.single('file'), filesController.postFile);
router.post('/file/field-file', authorised, fileUpload.single('file'), filesController.postFieldFile);
router.post('/file/signature', authorised, filesController.postSignature);
router.delete('/file/:id', authorised, filesController.deleteFile);

// Users
router.get('/all-users', authorised, usersController.getAllUsers);
router.get('/users/all/:facilityid', authorised, usersController.getAllUsersForFacility);
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

// Revenue
router.get('/revenue/:facilityid', authorised, revenueController.getFacilityRevenue);

// Dashboard
router.get('/dashboard/jobs/:facilityid', authorised, dashboardsController.getDashboardJobs)
router.get('/dashboard/spares/:facilityid', authorised, dashboardsController.getDashboardSpares)
router.get('/dashboard/revenue/:facilityid', authorised, dashboardsController.getDashboardRevenue)

// Facilities
router.get('/facilities/availabletouser', authorised, facilitiesController.getFacilitiesForUser);
router.get('/facilities/all-facilities', authorised, facilitiesController.getAllFacilities);
router.get('/facilities/:facilityid', authorised, facilitiesController.getFacilityDetails);
router.put('/facilities', authorised, facilitiesController.addEditFacility);
//// Facilty Users
router.get('/facilities/users-for-assigning/:facilityid', authorised, facilitiesController.getUsersForAssign);
router.put('/facilities/assign-users', authorised, facilitiesController.setAssignedUsers);
//// Last Facility
router.get('/facilities/last-facility/:userid', facilitiesController.getLastFacility);
router.put('/facilities/Last-facility', authorised, facilitiesController.setLastFacility);

// Jobs
router.get('/jobs/all-jobs/:facilityid', authorised, jobsController.getAllJobs);
router.get('/jobs/create-job', authorised, jobsController.getEnumsForCreateJob);
router.get('/jobs/:jobid', authorised, jobsController.getJobDetails);
router.get('/jobs/update/:facilityid/:jobid', authorised, jobsController.getJobUpdate);//
router.post('/jobs', authorised, jobsController.postJob);
router.put('/jobs/update', authorised, jobsController.updateAndComplete);
router.put('/jobs/notes', authorised, jobsController.updateNotes);

// PMs
router.get('/pms/:facilityid', authorised, PmsController.getAllPMs)
router.get('/pms/pm/:pmid', authorised, PmsController.getPMDetails)
router.get('/pms/edit/:facilityid/:scheduleid', authorised, PmsController.getEditPM);
router.put('/pms/edit', authorised, PmsController.editPM);

// PM Schedules
router.get('/pms/schedules/all-schedules/:facilityid', authorised, PmsController.getAllPMSchedules);
router.get('/pms/schedules/:facilityid/:scheduleid', authorised, PmsController.getPMSchedule);
router.get('/pms/schedules/add-schedule', authorised, PmsController.getAddSchedule);
router.get('/pms/schedule/edit-schedule/:scheduleid', authorised, PmsController.getEditSchedule);
router.post('/pms/schedules', authorised, PmsController.addPMSchedule);
router.put('/pms/schedules', authorised, PmsController.editPMSchedule);
router.delete('/pms/schedules/:id', authorised, PmsController.deletePMSchedule);

// Logs
router.get('/logs/all-log-templates/:facilityid', authorised, logsController.getAllLogTemplates);
router.get('/logs/log-templates/:facilityid/:logtemplateid', authorised, logsController.getLogTemplate);
router.get('/logs/all-logs/:facilityid', authorised, logsController.getAllLogs);
router.get('/logs/log/:logid', authorised, logsController.getLog);
router.get('/logs/edit-log-template/:logtemplateid', authorised, logsController.getEditLogTemplate);
router.get('/logs/log-fields/:logid', authorised, logsController.getLogFields);
router.post('/logs/log-templates', authorised, logsController.addEditLogTemplate);
router.put('/logs/log', authorised, logsController.updateLog);
router.delete('/logs/log-templates/:id', authorised, logsController.deleteLogTemplate);

// Assets
router.get('/asset-tree/:facilityid', authorised, assetsController.getAssetTree);
router.get('/asset/:assetid', authorised, assetsController.getAsset);
router.get('/assets/revenues/:facilityid', authorised, assetsController.getAssetsWithRevenues);
router.post('/asset', authorised, assetsController.addEditAsset);
router.delete('/asset/:id', authorised, assetsController.deleteAsset);

// Spares
router.get('/all-spares/:facilityid', authorised, sparesController.getallSpares);
router.get('/spare/:spareid/:facilityid', authorised, sparesController.getSpare);
router.get('/spares-for-use/:facilityid', authorised, sparesController.getSparesForUse);
router.get('/spares/instock/:spareid', authorised, sparesController.getSpareStock);
router.put('/spares/add-edit', authorised, sparesController.addEditSpare);
router.put('/spares/adjust-stock', authorised, sparesController.adjustSpareStock);
router.delete('/spares/item/:id', authorised, sparesController.deleteSparesItem);
//// Spares Suppliers
router.get('/spares/suppliers/:facilityid', authorised, sparesController.getSuppliers);
router.get('/spares/supplier/:supplierid', authorised, sparesController.getSuplierInfo);
router.put('/spares/supplier', authorised, sparesController.addEditSupplier);
router.delete('/spares/supplier/:id', authorised, sparesController.deleteSupplier);
//// Spares Deliveries
router.get('/spares/deliveries/:facilityid/:deliveryid', authorised, sparesController.getDeliveries);
router.put('/spares/delivery/add-edit', authorised, sparesController.addEditDelivery);
router.delete('/spares/delivery/:id', authorised, sparesController.deleteDelivery);
//// Spares Warnings
router.get('/spares/warnings/:facilityid', authorised, sparesController.getSparesWarnings);
//// Spares Notes
router.get('/spares/notes/:facilityid', authorised, sparesController.getSparesNotes);
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

// Task Types
router.get('/tasktypes', authorised, taskTypesController.getJobTypes);
router.get('/tasktypes/:id', authorised, taskTypesController.getJobTypeById);
router.put('/tasktypes', authorised, taskTypesController.addEditJobType);
router.delete('/tasktypes/:id', authorised, taskTypesController.deleteJobType);

// Status Types
router.get('/statustypes', authorised, statusTypesController.getStatusTypes);
router.get('/statustypes/:id', authorised, statusTypesController.getStatusTypeById);
router.put('/statustypes', authorised, statusTypesController.addEditStatusType);
router.delete('/statustypes/:id', authorised, statusTypesController.deleteStatusType);

// Urgency Types
router.get('/urgencytypes', authorised, urgencyTypesController.getUrgencyTypes);
router.get('/urgencytypes/:id', authorised, urgencyTypesController.getUrgencyTypeById);
router.put('/urgencytypes', authorised, urgencyTypesController.addEditUrgencyType);
router.delete('/urgencytypes/:id', authorised, urgencyTypesController.deleteUrgencyType);

// Fields
router.get('/fields/:model/:modeltypeid', authorised, customFieldsController.getFieldsForModel);
router.get('/field/:id', authorised, customFieldsController.getFieldById);
router.post('/fields', authorised, customFieldsController.addEditField);
router.delete('/fields/:id', authorised, customFieldsController.deleteField);

export default router;
