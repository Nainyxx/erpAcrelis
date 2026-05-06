const MANAGEMENT_ALLOWED_ROLES = ['Director', 'ProjectManager', 'TeamLead', 'Admin'];

export const PROJECT_ACTIONS_ALLOWED_ROLES = MANAGEMENT_ALLOWED_ROLES;

/** Роли с доступом к корню раздела «Операции» (остальные — на персональные финансы). */
export const OPERATIONS_HUB_ALLOWED_ROLES = MANAGEMENT_ALLOWED_ROLES;
