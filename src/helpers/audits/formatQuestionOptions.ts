import { AuditQuestion, AuditQuestionOption } from "../../types/audits/auditQuestions";

export const formatQuestionOptions = (questions: AuditQuestion[], options: AuditQuestionOption[]) => {
    return questions.map((question) => {
        if (['select', 'multi-select', 'radio'].includes(question.question_type)) {
            question.options = options.filter((option) => option.question_id === question.id);
        }
        return question;
    });
}