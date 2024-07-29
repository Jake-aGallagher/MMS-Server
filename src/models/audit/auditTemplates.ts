import { FieldPacket, ResultSetHeader } from "mysql2";
import getConnection from "../../database/database";
import { AuditTemplateVersion, AuditVersion } from "../../types/audits/auditTemplates";

export async function getAuditTemplates(client: string) {
    const db = await getConnection('client_' + client);
    const data = await db.execute(
        `SELECT
            id,
            title,
            latest_version
        FROM
            audit_templates;`
    );
    console.log(data[0]);
    return data[0];
}

export async function getTemplateVersions(client: string, templateId: number) {
    const db = await getConnection('client_' + client);
    const data = await db.execute(
        `SELECT
            id,
            title,
            version
        FROM
            audit_versions
        WHERE
            template_id = ?
        ORDER BY
            version
        DESC;`,
        [templateId]
    );
    return data[0];
}

export async function getAuditVersion(client: string, templateId: number, version: number) {
    const db = await getConnection('client_' + client);
    const data: [AuditTemplateVersion[], FieldPacket[]] = await db.execute(
        `SELECT
            id,
            title,
            version
        FROM
            audit_versions
        WHERE
            template_id = ?
        AND
            version = ?;`,
        [templateId, version]
    );
    return data[0][0];
}

export async function getVersionId(client: string, templateId: number, version: number) {
    const db = await getConnection('client_' + client);
    const data: [AuditVersion[], FieldPacket[]] = await db.execute(
        `SELECT
            id
        FROM
            audit_versions
        WHERE
            template_id = ?
        AND
            version = ?;`,
        [templateId, version]
    );
    return data[0][0].id;
}

export async function addAuditTemplate(client: string, title: string) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            audit_templates
            (
                title,
                latest_version
            )
        VALUES
            (?, 1);`,
        [title]
    );

    const auditTemplateId = response[0].insertId;
    
    await db.execute(
        `INSERT INTO
            audit_versions
            (
                template_id,
                version,
                title
            )
        VALUES
            (?, 1, ?);`,
        [auditTemplateId, title]
    );

    return auditTemplateId;
}

export async function updateAuditTemplate(client: string, templateId: number, title: string) {
    const db = await getConnection('client_' + client);
    await db.execute(
        `UPDATE
            audit_templates
        SET
            latest_version = latest_version + 1
        WHERE
            audit_template_id = ?;`,
        [templateId]
    );

    const data: [AuditVersion[], FieldPacket[]] = await db.execute(
        `SELECT
            latest_version
        FROM
            audit_templates
        WHERE
            id = ?;`,
        [templateId]
    );
    const version = data[0][0].latest_version;

    await db.execute(
        `INSERT INTO
            audit_versions
            (
                template_id,
                version,
                title
            )
        VALUES
            (?, ?, ?);`,
        [templateId, version, title]
    );

}