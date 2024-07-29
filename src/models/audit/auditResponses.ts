import { FieldPacket } from 'mysql2';
import getConnection from '../../database/database';
import { AuditResponse, AuditResponseForInsert } from '../../types/audits/auditResponses';

export async function getAuditResponses(client: string, auditId: number) {
    const db = await getConnection('client_' + client);
    const data: [AuditResponse[], FieldPacket[]] = await db.execute(
        `SELECT
            id,
            audit_id,
            response
        FROM
            audit_responses
        WHERE
            audit_id = ?;`,
        [auditId]
    );
    return data[0];
}

export async function addResponses(client: string, auditId: number, responses: AuditResponseForInsert[]) {
    const db = await getConnection('client_' + client);
    const responseArray = responses.map((r) => {return [auditId, r.question_id, r.response]});
    await db.execute(
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
    return;
}