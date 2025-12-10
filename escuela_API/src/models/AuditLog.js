/**
 * Bitácora de acciones relevantes ejecutadas dentro de la API.
 * Útil para trazabilidad, revisiones y seguridad.
 */
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    metadata: { type: Object },
  },
  {
    timestamps: true,
  },
);

auditLogSchema.index({ entity: 1, entityId: 1, action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
