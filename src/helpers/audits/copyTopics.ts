import { FieldPacket, ResultSetHeader } from 'mysql2';
import getConnection from '../../database/database';
import { AuditTopic } from '../../types/audits/auditTopics';

export const copyTopics = async (client: string, prevVersionId: number, newVersionId: number) => {
    const db = await getConnection('client_' + client);

    // select all topics from the old template version
    const data: [AuditTopic[], FieldPacket[]] = await db.execute(
        `SELECT
            id,
            title,
            sort_order
        FROM
            audit_topics
        WHERE
            version_id = ?
        AND
            deleted = 0;`,
        [prevVersionId]
    );

    // create topic id and insert array
    const oldIds: number[] = [];
    const insertArr: [string, number, number][] = [];
    data[0].forEach((t) => {
        oldIds.push(t.id);
        insertArr.push([t.title, t.sort_order, newVersionId]);
    });

    if (insertArr.length === 0) {
        return [];
    }

    // insert the topics into the new template version
    const sql = db.format(
        `INSERT INTO
            audit_topics
            (title, sort_order, version_id)
        VALUES
            ?;`,
        [insertArr]
    );

    const [result]: [ResultSetHeader, FieldPacket[]] = await db.execute(sql);

    // create the return array of old and new topic ids
    const insertedIds: { old: number; new: number }[] = [];
    for (let i = 0; i < result.affectedRows; i++) {
        insertedIds.push({ old: oldIds[i], new: result.insertId + i });
    }

    return insertedIds;
};
