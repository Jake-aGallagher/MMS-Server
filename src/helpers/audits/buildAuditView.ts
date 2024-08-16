import * as AuditTopics from '../../models/audit/auditTopics';
import * as AuditQuestions from '../../models/audit/auditQuestions';
import * as AuditResponses from '../../models/audit/auditResponses';
import makeIdList from '../makeIdList';
import { AuditQuestion } from '../../types/audits/auditQuestions';
import { formatQuestionOptions } from './formatQuestionOptions';
import { formatTopicQuestions } from './formatTopicQuestions';
import { AuditResponse } from '../../types/audits/auditResponses';
import { getFieldFileData } from '../../models/files';

export const buildAuditView = async (client: string, versionId: number, auditId: number) => {
    let topics = await AuditTopics.getTopicsForAudit(client, versionId);
    const topicIds = makeIdList(topics, 'id');
    let questions: AuditQuestion[] = [];

    const fileIds: string[] = [];
    let fileData: { [key: string]: { id: string; encodedId: string; name: string }[] } = {};
    const fileIdToFieldIdMap: { [key: string]: number } = {};

    if (topicIds.length > 0) {
        questions = await AuditQuestions.getAuditQuestions(client, topicIds);
        const enumTypes = ['select', 'multi-select', 'radio'];
        const enumQuestionIds = questions.filter((question) => enumTypes.includes(question.question_type)).map((question) => question.id);
        if (enumQuestionIds.length > 0) {
            const options = await AuditQuestions.getQuestionOptions(client, enumQuestionIds);
            questions = formatQuestionOptions(questions, options);
        }
        const responses = await AuditResponses.getAuditResponses(client, auditId);
        let responseObj: { [key: number]: AuditResponse } = {};
        responses.forEach((response) => {
            responseObj[response.question_id] = response;
        });
        questions = questions.map((question) => {
            if (responseObj[question.id]) {
                question.response = { responseId: responseObj[question.id].id, responseValue: responseObj[question.id].response };
            }

            // if the question is image file or signature then sort out file data
            if (question.question_type === 'image' || question.question_type === 'signature' || question.question_type === 'file') {
                const filesString = question.response?.responseValue;
                if (filesString) {
                    const fileIdsArr = filesString.split(',');
                    fileIdsArr.forEach((fileId: string) => {
                        fileIds.push(fileId);
                        fileIdToFieldIdMap[fileId] = question.id;
                    });
                }
            }
            
            return question;
        });
        topics = formatTopicQuestions(topics, questions);
    }

    if (fileIds.length > 0) {
        fileData = await getFieldFileData(client, fileIds, fileIdToFieldIdMap);
    }

    return {topics, fileData};
};
