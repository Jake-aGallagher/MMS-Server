import { FieldPacket, ResultSetHeader } from 'mysql2';
import getConnection from '../../database/database';

export async function addAudit(client: string, model: string, modelId: number, templateId: number, templateVersion: number) {
    const db = await getConnection('client_' + client);

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            audits
            (
                template_id,
                template_version,
                model,
                model_id
            )
        VALUES
            (?, ?, ?, ?);`,
        [templateId, templateVersion, model, modelId]
    );

    return response[0].insertId;
}
