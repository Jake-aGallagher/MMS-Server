import express from 'express';
const router = express.Router();
import { authorised } from '../middleware/authentication';

import * as auditsController from '../controllers/audit/audits';
import * as auditTemplatesController from '../controllers/audit/auditTemplates';
import * as auditTopicsController from '../controllers/audit/auditTopics';
import * as auditQuestionsController from '../controllers/audit/auditQuestions';

router.get('/templates', authorised, auditTemplatesController.getAuditTemplates);
router.get('/template/:templateid/version/:version', authorised, auditTemplatesController.getAuditTemplate);
router.get('/template/:templateid', authorised, auditTemplatesController.getAuditTemplateLatestDetails);
router.post('/template', authorised, auditTemplatesController.addAuditTemplate);

router.get('/versions/:id', authorised, auditTemplatesController.getTemplateVersions);
router.post('/version/publish', authorised, auditTemplatesController.publishVersion);
router.put('/version', authorised, auditTemplatesController.addAuditVersion);

router.get('/topic/:topicid', authorised, auditTopicsController.getAuditTopic);
router.put('/topic', authorised, auditTopicsController.addEditAuditTopic);
router.delete('/topic/:id', authorised, auditTopicsController.deleteAuditTopic);

router.get('/question/:questionid', authorised, auditQuestionsController.getAuditQuestion);
router.put('/question', authorised, auditQuestionsController.addEditAuditQuestion);
router.delete('/question/:id', authorised, auditQuestionsController.deleteAuditQuestion);

router.get('/option/:optionid', authorised, auditQuestionsController.getAuditOption);
router.put('/option', authorised, auditQuestionsController.addEditAuditOption);
router.delete('/option/:id', authorised, auditQuestionsController.deleteAuditOption);

router.get('/assignments/:assignmenttype', authorised, auditTemplatesController.getAssignments);

router.get('/wizard/:eventtype/:eventid', authorised, auditsController.getAudit);
router.put('/wizard', authorised, auditsController.editAudit);

export default router;
