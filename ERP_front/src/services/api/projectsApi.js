import { requestAuth } from './httpClient';

export async function downloadProjectFile(fileUrl) {
  const response = await requestAuth(fileUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/octet-stream'
    }
  });
  return response.blob();
}

export async function deleteProjectFileById(fileId) {
  await requestAuth(`staff/staff/${fileId}/`, { method: 'DELETE' });
}
