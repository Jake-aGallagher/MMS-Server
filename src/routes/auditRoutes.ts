import express from 'express';
const router = express.Router();
import { authorised } from '../middleware/authentication';

import * as auditTemplatesController from '../controllers/audit/auditTemplates';
import * as auditTopicsController from '../controllers/audit/auditTopics';
import * as auditQuestionsController from '../controllers/audit/auditQuestions';

router.get('/templates', authorised, auditTemplatesController.getAuditTemplates);
router.get('/template/:templateid/version/:version', authorised, auditTemplatesController.getAuditTemplate);
router.post('/template', authorised, auditTemplatesController.addAuditTemplate);

router.get('/versions/:id', authorised, auditTemplatesController.getTemplateVersions);

router.get('/topic/:topicid', authorised, auditTopicsController.getAuditTopic);
router.put('/topic', authorised, auditTopicsController.addEditAuditTopic);
router.delete('/topic/:id', authorised, auditTopicsController.deleteAuditTopic);

router.get('/question/:questionid', authorised, auditQuestionsController.getAuditQuestion);
router.put('/question', authorised, auditQuestionsController.addEditAuditQuestion);
router.delete('/question/:id', authorised, auditQuestionsController.deleteAuditQuestion);

router.get('/option/:optionid', authorised, auditQuestionsController.getAuditOption);
router.put('/option', authorised, auditQuestionsController.addEditAuditOption);
router.delete('/option/:id', authorised, auditQuestionsController.deleteAuditOption);



export default router;
