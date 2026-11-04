import { collections } from '@/constants/_core/constants';
import {
  getContentVersionSnapshotSchema, getContentVersionsSchema,
} from '@/validations/_core/contentVersion.validations';

import { getContentVersions, getContentVersionSnapshot } from '../../services/_core/contentVersion.service.cloud';
import { fromBO } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

Parse.Cloud.define(
  'getContentVersions',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Record<string, any>> => {
    const {
      entityType, entityId, limit, skip,
    } = request.params;

    return getContentVersions({
      entityType, entityId, limit, skip,
    });
  }, ['find'], collections.ContentVersion),
  parseFunctionValidation(getContentVersionsSchema)
);

Parse.Cloud.define(
  'getContentVersionSnapshot',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Record<string, any> | undefined> => {
    const {
      entityType, entityId, versionId,
    } = request.params;

    return getContentVersionSnapshot({ entityType, entityId, versionId });
  }, ['get'], collections.ContentVersion),
  parseFunctionValidation(getContentVersionSnapshotSchema)
);
