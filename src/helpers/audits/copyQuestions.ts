import { FieldPacket, ResultSetHeader } from 'mysql2';
import getConnection from '../../database/database';
import { AuditQuestion } from '../../types/audits/auditQuestions';

export const copyQuestions = async (client: string, topicIdMap: { old: number; new: number }[]) => {
    const db = await getConnection('client_' + client);

    // select all questions from the old topic ids
    const oldTopics = topicIdMap.map((t) => t.old);
    const sql = db.format(
        `SELECT
            id,
            topic_id,
            title,
            question_type,
            sort_order
        FROM
            audit_questions
        WHERE
            topic_id IN (?)
        AND
            deleted = 0;`,
        [oldTopics]
    );
    const data: [AuditQuestion[], FieldPacket[]] = await db.execute(sql);

    // create question id and insert array
    const oldIds: number[] = [];
    const insertArr: [number, string, string, number][] = [];
    data[0].forEach((q) => {
        oldIds.push(q.id);
        const newTopicId = topicIdMap.find((t) => t.old === q.topic_id)!.new;
        insertArr.push([newTopicId, q.title, q.question_type, q.sort_order]);
    });

    if (insertArr.length === 0) {
        return [];
    }

    // insert the questions into the new topic ids
    const sqlInsert = db.format(
        `INSERT INTO
            audit_questions
            (topic_id, title, question_type, sort_order)
        VALUES
            ?;`,
        [insertArr]
    );

    const [result]: [ResultSetHeader, FieldPacket[]] = await db.execute(sqlInsert);

    // create the return array of old and new question ids
    const insertedIds: { old: number; new: number }[] = [];
    for (let i = 0; i < result.affectedRows; i++) {
        insertedIds.push({ old: oldIds[i], new: result.insertId + i });
    }

    return insertedIds;
};
