'use strict';

/**
 * tenantGuard
 *
 * Ensures the authenticated user can only access resources belonging to their
 * own organisation (req.user.org_id).
 *
 * The check is satisfied if any of the following are true:
 *   1. The user's role is 'ERP' (super-admin bypass).
 *   2. The org_id in the request (body, query, or params) matches req.user.org_id.
 *   3. No org_id is present in the request — the route handler is responsible for
 *      scoping by req.user.org_id itself (considered safe).
 *
 * Routes that embed org_id in the URL (e.g. /api/v1/employees?org_id=xxx) are
 * guarded automatically. Routes that scope entirely via req.user.org_id in the
 * handler don't need the param — the middleware passes them through.
 */
function tenantGuard(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // ERP role has cross-tenant access
  if (req.user.role === 'ERP') {
    return next();
  }

  // Resolve the requested org_id from all possible sources
  const requestedOrgId =
    req.body?.org_id ||
    req.query?.org_id ||
    req.params?.org_id ||
    null;

  if (requestedOrgId && requestedOrgId !== req.user.org_id) {
    return res.status(403).json({
      error: 'Access denied — you can only access resources belonging to your organisation',
    });
  }

  return next();
}

module.exports = { tenantGuard };
