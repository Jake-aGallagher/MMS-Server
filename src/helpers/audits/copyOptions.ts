import { FieldPacket } from "mysql2";
import getConnection from "../../database/database";
import { AuditOption } from "../../types/audits/auditQuestions";

export const copyOptions = async (client: string, questionIdMap: { old: number; new: number }[]) => {
    const db = await getConnection('client_' + client);

    // select all question options from the old question ids
    const oldQuestions = questionIdMap.map((q) => q.old);
    const sql = db.format(
        `SELECT
            id,
            question_id,
            title,
            sort_order
        FROM
            audit_question_options
        WHERE
            question_id IN (?)
        AND
            deleted = 0;`,
        [oldQuestions]
    );
    const data: [AuditOption[], FieldPacket[]] = await db.execute(sql);

    // create question option id and insert array
    const oldIds: number[] = [];
    const insertArr: [number, string, number][] = [];
    data[0].forEach((o) => {
        oldIds.push(o.id);
        const newQuestionId = questionIdMap.find((q) => q.old === o.question_id)!.new;
        insertArr.push([newQuestionId, o.title, o.sort_order]);
    });

    if (insertArr.length === 0) {
        return;
    }

    // insert the question options into the new questions
    const sqlInsert = db.format(
        `INSERT INTO
            audit_question_options
            (question_id, title, sort_order)
        VALUES
            ?;`,
        [insertArr]
    );

    await db.execute(sqlInsert);
    return;
}