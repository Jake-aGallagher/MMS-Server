import express from 'express';
const router = express.Router();
import { authorised } from '../middleware/authentication';

import * as jobsController from '../controllers/maintenance/jobs';
import * as PmsController from '../controllers/maintenance/pms';
import * as logsController from '../controllers/maintenance/logs';
import * as assetsController from '../controllers/maintenance/assets';
import * as taskTypesController from '../controllers/maintenance/jobTypes';
import * as statusTypesController from '../controllers/maintenance/statusTypes';
import * as urgencyTypesController from '../controllers/maintenance/urgencyTypes';

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

export default router;