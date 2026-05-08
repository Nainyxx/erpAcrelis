/**
 * Мапперы сущностей: один проход по сырым данным с бэка → нормализованный объект для UI.
 * Заменяют локальные `formattedProjects.map(...)` и подобные блоки в api.js.
 */

import {
  getProjectStatusLabel,
  getProjectTypeLabel
} from '../../constants/projects';
import { formatDateForDisplay, formatDateTime } from './formatters';

/** Краткая запись проекта для списка (используется в getProjects). */
export function formatProjectListItem(project) {
  return {
    id: project.id,
    name: project.name,
    type: project.type || 'other',
    typeLabel: getProjectTypeLabel(project.type),
    status: project.status || 'draft',
    price: project.price || '0.00',
    hours: project.hours || 0,
    customer: project.customer || 'Не указан',
    startDate: formatDateForDisplay(project.start_date || project.startDate || project.created),
    deadline: formatDateForDisplay(project.deadline),
    team: project.performers || project.team || []
  };
}

/** Полный объект проекта для карточки (используется в getProjectById/createProject/updateProject). */
export function formatProjectData(project) {
  return {
    id: project.id,
    name: project.name,
    type: project.type || 'other',
    typeLabel: getProjectTypeLabel(project.type),
    type_display: project.type_display || getProjectTypeLabel(project.type),

    status: project.status || 'draft',
    status_display: project.status_display || getProjectStatusLabel(project.status),
    price: project.price || '0.00',
    hours: project.hours || 0,
    customer: project.customer || 'Не указан',

    startDate: project.start_date || project.created || '',
    deadline: project.deadline || '',

    startDateFormatted: formatDateForDisplay(project.start_date || project.created),
    deadlineFormatted: formatDateForDisplay(project.deadline),

    performers: project.performers || [],

    team: (project.performers || []).map((p) => ({
      id: p.id,
      name: p.staff_name || 'Исполнитель',
      staff_name: p.staff_name || 'Исполнитель',
      staff_image: p.staff_image,
      role: p.staff_post || 'Участник',
      assigned_at: p.assigned_at
    })),

    files: (project.files || []).map((file) => ({
      id: file.id,
      name: file.original_filename || file.file.split('/').pop(),
      originalName: file.original_filename || file.file.split('/').pop(),
      file: file.file || file.file_url,
      uploaded_at: file.uploaded_at,
      size: file.size || file.file_size || 0
    })),

    logs: project.logs || [],
    ganttTasks: []
  };
}

/** Группировка типов с подсчётом количества (без пункта «all» — его рисует UI). */
export function generateProjectTypes(projects) {
  const typeCounts = {};
  projects.forEach((project) => {
    typeCounts[project.type] = (typeCounts[project.type] || 0) + 1;
  });

  return Object.entries(typeCounts).map(([type, count]) => ({
    id: type,
    label: getProjectTypeLabel(type),
    count
  }));
}

/** Краткая запись сотрудника для списка (getStaffList). */
export function formatStaffListItem(staff) {
  return {
    id: staff.id,
    name: staff.name,
    position: staff.post || staff.position || 'Сотрудник',
    post: staff.post || 'Сотрудник',
    department: staff.department?.toString() || '0',
    departmentLabel: staff.department_name || 'Не указан',
    email: staff.email,
    phone: staff.phone,
    birthday: staff.birthday,
    telegram: staff.telegram,
    is_active: staff.is_active,
    image: staff.image || null,
    image_url: staff.image_url || staff.image || null
  };
}

/** Полная карточка сотрудника (getEmployeeById). */
export function formatEmployee(staffData) {
  return {
    id: staffData.id,
    name: staffData.name,
    position: staffData.post,
    post: staffData.post,
    image: staffData.image || null,
    image_url: staffData.image_url || staffData.image || null,
    department: staffData.department?.toString() || '0',
    departmentLabel: staffData.department_name || 'Не указан',
    email: staffData.email,
    phone: staffData.phone,
    birthday: staffData.birthday,
    dream: staffData.dream || '',
    is_active: staffData.is_active,
    created: staffData.created,
    telegram: staffData.telegram || '@acrelis',
    current_tasks: staffData.current_tasks || 0,
    closed_on_time_tasks: staffData.closed_on_time_tasks || 0,
    closed_late_tasks: staffData.closed_late_tasks || 0,
    failed_tasks: staffData.failed_tasks || 0,
    director: staffData.director || null,
    statistic_percent: staffData.statistic_percent ?? null,
    statistic_label: staffData.statistic_label ?? '',
    shared_project_team: staffData.shared_project_team,
    joint_project_collaborators: staffData.joint_project_collaborators,
    coworkers_shared_projects: staffData.coworkers_shared_projects,
    shared_project_members: staffData.shared_project_members
  };
}

/** Лог проекта → формат UI (getProjectLogs). */
export function formatProjectLog(log) {
  return {
    id: log.id,
    action: log.content,
    date: formatDateTime(log.created)
  };
}
