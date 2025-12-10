/**
 * Servicio ligero para registrar acciones en la colección auditLogs.
 * Se importa en controladores cuando se requiera trazar operaciones sensibles.
 */
const AuditLog = require('../models/AuditLog');
const logger = require('./logger');

const logAudit = async ({
  action,
  entity,
  entityId,
  performedBy,
  metadata = {},
}) => {
  try {
    await AuditLog.create({
      action,
      entity,
      entityId: entityId ? entityId.toString() : 'N/A',
      performedBy,
      metadata,
    });
  } catch (error) {
    logger.error('No se pudo registrar el audit log', { error });
  }
};

module.exports = logAudit;
