import Parse from 'parse';

export const clearRecycleBin = async (limit: number): Promise<void> => {
  await Parse.Cloud.run('clearRecycleBinInCloud', { limit });
};

export const purgeOrphanedEditorFiles = async (olderThanHours: number): Promise<void> => {
  await Parse.Cloud.run('purgeOrphanedEditorFilesInCloud', { olderThanHours });
};
