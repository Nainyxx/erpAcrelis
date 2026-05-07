import { getEmployeeById, getStaffDepartments, getStaffList, updateEmployeeById } from './api';
import { requestAuth } from './httpClient';

export { getStaffList, getStaffDepartments, getEmployeeById, updateEmployeeById };

export async function fetchStaffById(staffId) {
  const response = await requestAuth(`staff/staff/${staffId}/`, { method: 'GET' });
  return response.json();
}

export async function getDirectorsList() {
  const response = await requestAuth('staff/directors/', { method: 'GET' });
  return response.json();
}
