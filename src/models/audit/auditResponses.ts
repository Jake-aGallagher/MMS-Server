import { FieldPacket } from 'mysql2';
import getConnection from '../../database/database';
import { AuditResponse, AuditResponseForInsert } from '../../types/audits/auditResponses';

export async function getAuditResponses(client: string, auditId: number) {
    const db = await getConnection('client_' + client);
    const data: [AuditResponse[], FieldPacket[]] = await db.execute(
        `SELECT
            id,
            audit_id,
            question_id,
            response
        FROM
            audit_responses
        WHERE
            audit_id = ?;`,
        [auditId]
    );
    return data[0];
}

export async function updateResponses(client: string, auditId: number, responses: AuditResponseForInsert[]) {
    const db = await getConnection('client_' + client);
    try {
        const conn = await db.getConnection();
        await conn.beginTransaction();
        await conn.execute(
            `DELETE FROM
            audit_responses
        WHERE
            audit_id = ?;`,
        [auditId]
        );
        const responseArray = responses.map((r) => {return [auditId, r.question_id, r.response]});
        if (responseArray.length > 0) {
            const sqlInsert = db.format(
                `INSERT INTO
                    audit_responses
                    (
                        audit_id,
                        question_id,
                        response
                    )
                VALUES
                    ?;`,
                    [responseArray]
            );
            await conn.execute(sqlInsert);
        }
        await conn.commit();
        conn.release();
    } catch (err) {
        console.log(err);
        return false;
    }
    return true;
}