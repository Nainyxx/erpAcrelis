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

export async function deleteProjectFileById(projectId, fileId) {
  await requestAuth(`projects/projects/${projectId}/files/${fileId}/`, { method: 'DELETE' });
}
