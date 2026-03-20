const { AuditLog } = require('../models');

function pickUserContext(req) {
  return {
    userId: req?.user?.id || null,
    role: req?.user?.role || 'system',
    ipAddress: req?.ip || null,
    userAgent: req?.headers?.['user-agent'] || null
  };
}

async function logAudit({
  req,
  userId,
  role,
  action,
  entityType = null,
  entityId = null,
  oldData = null,
  newData = null,
  status = 'success'
}) {
  try {
    const context = pickUserContext(req);
    await AuditLog.create({
      userId: userId ?? context.userId,
      role: role ?? context.role,
      action,
      entityType,
      entityId,
      oldData,
      newData,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      status
    });
  } catch (error) {
    console.error('Audit util failed:', error.message);
  }
}

module.exports = {
  logAudit
};
