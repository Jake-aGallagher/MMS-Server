import express from 'express';
const router = express.Router();
import { fileUpload } from '../middleware/multer';
import { authorised, checkAuth } from '../middleware/authentication';

import * as usersController from '../controllers/users';
import * as filesController from '../controllers/files';
import * as dashboardsController from '../controllers/dashboards';
import * as revenueController from '../controllers/revenue';
import * as facilitiesController from '../controllers/facilities';
import * as sparesController from '../controllers/spares';
import * as suppliersController from '../controllers/suppliers';
import * as enumsController from '../controllers/enums';
import * as permissionsController from '../controllers/permissions';
import * as customFieldsController from '../controllers/customFields';

// Auth
router.get('/check-auth', checkAuth);

// Files
router.get('/getfile/:clientid/:fileid', filesController.getFile);
router.get('/getimage/:clientid/:imageid', filesController.getImage);
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
router.get('/facilities/last-facility/:userid', authorised, facilitiesController.getLastFacility);
router.put('/facilities/Last-facility', authorised, facilitiesController.setLastFacility);

// Spares
router.get('/all-spares/:facilityid', authorised, sparesController.getallSpares);
router.get('/spare/:spareid/:facilityid', authorised, sparesController.getSpare);
router.get('/spares-for-use/:facilityid', authorised, sparesController.getSparesForUse);
router.get('/spares/instock/:spareid', authorised, sparesController.getSpareStock);
router.put('/spares/add-edit', authorised, sparesController.addEditSpare);
router.put('/spares/adjust-stock', authorised, sparesController.adjustSpareStock);
router.delete('/spares/item/:id', authorised, sparesController.deleteSparesItem);
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

//// Suppliers
router.get('/suppliers/:facilityid', authorised, suppliersController.getSuppliers);
router.get('/supplier/:supplierid', authorised, suppliersController.getSuplierInfo);
router.put('/supplier', authorised, suppliersController.addEditSupplier);
router.delete('/supplier/:id', authorised, suppliersController.deleteSupplier);

// Enums
router.get('/enumgroups', authorised, enumsController.getEnumsGroups);
router.get('/enumgroup/:id', authorised, enumsController.getEnumsGroupById);
router.get('/enumgroups/:id', authorised, enumsController.getEnumsByGroupId);
router.put('/enumgroups', authorised, enumsController.addEditEnumGroup);
router.delete('/enumgroups/:id', authorised, enumsController.deleteEnumGroup);
router.get('/enumvalue/:id', authorised, enumsController.getEnumValueById);
router.put('/enumvalues', authorised, enumsController.addEditEnumValue);
router.delete('/enumvalues/:id', authorised, enumsController.deleteEnumValue);

// Fields
router.get('/fields/:model/:modeltypeid', authorised, customFieldsController.getFieldsForModel);
router.get('/field/:id', authorised, customFieldsController.getFieldById);
router.post('/fields', authorised, customFieldsController.addEditField);
router.delete('/fields/:id', authorised, customFieldsController.deleteField);

export default router;
