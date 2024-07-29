import { AuditQuestion } from "../../types/audits/auditQuestions";
import { AuditTopic } from "../../types/audits/auditTopics";

export const formatTopicQuestions = (topics: AuditTopic[], questions: AuditQuestion[]) => {
    return topics.map((topic) => {
        topic.questions = questions.filter((question) => question.topic_id === topic.id);
        return topic;
    });
}