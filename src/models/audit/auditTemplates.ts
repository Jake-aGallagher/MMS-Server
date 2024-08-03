import { FieldPacket, ResultSetHeader } from "mysql2";
import getConnection from "../../database/database";
import { AuditTemplateVersion, AuditVersion, LatestDetails } from "../../types/audits/auditTemplates";

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
    return data[0];
}

export async function getTemplateVersions(client: string, templateId: number) {
    const db = await getConnection('client_' + client);
    const data = await db.execute(
        `SELECT
            audit_versions.id,
            audit_versions.title,
            audit_versions.version,
            audit_versions.published,
            IF(audit_versions.version = audit_templates.latest_version, 1, 0) AS latest
        FROM
            audit_versions
        INNER JOIN audit_templates ON
        (
            audit_versions.template_id = audit_templates.id
        )
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
            version,
            published
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

export async function getLatestDetails(client: string, templateId: number) {
    const db = await getConnection('client_' + client);
    const data: [LatestDetails[], FieldPacket[]] = await db.execute(
        `SELECT
            title,
            latest_version
        FROM
            audit_templates
        WHERE
            id = ?;`,
        [templateId]
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
                title,
                published
            )
        VALUES
            (?, 1, ?, 0);`,
        [auditTemplateId, title]
    );

    return auditTemplateId;
}

export async function addAuditVersion(client: string, title: string, templateId: number, version: number) {
    const db = await getConnection('client_' + client);
    await db.execute(`UPDATE audit_templates SET title = ?, latest_version = ? WHERE id = ?;`, [title, version, templateId]);

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            audit_versions
            (
                template_id,
                version,
                title,
                published
            )
        VALUES
            (?, ?, ?, 0);`,
        [templateId, version, title]
    );

    return response[0].insertId;
}