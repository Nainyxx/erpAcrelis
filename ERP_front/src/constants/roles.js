const MANAGEMENT_ALLOWED_ROLES = ['Director', 'ProjectManager', 'TeamLead', 'Admin'];

export const PROJECT_ACTIONS_ALLOWED_ROLES = MANAGEMENT_ALLOWED_ROLES;

/** Роли с доступом к разделу «Операции» (/operations, /operations/request). */
export const OPERATIONS_HUB_ALLOWED_ROLES = MANAGEMENT_ALLOWED_ROLES;

export function canAccessOperationsHub(role) {
  return Boolean(role && OPERATIONS_HUB_ALLOWED_ROLES.includes(role));
}
