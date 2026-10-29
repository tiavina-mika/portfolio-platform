import Config from 'parse-server/lib/Config.js';

/**
 * connect to db directly
 * @param {*} className
 * @returns
 */
export const getMongoCollection = async (className: string): Promise<any> => {
  const config = Config.get(Parse.applicationId);
  const db = config.database;
  const mongoAdapter = db.adapter;

  await mongoAdapter.connect();
  return mongoAdapter.database.collection(className);
};

/**
 * to execute directly aggregate pipeline
 * @param {string} className
 * @param {Array} pipeline
 * @param {boolean} [withWeakCollation] (only used if necessary)
 */
export const aggregate = async (
  className: string,
  pipeline: any[],
  withWeakCollation = false
): Promise<any> => {
  // ---- configuration ----//
  const collection = await getMongoCollection(className);

  // ---- collation setting ----//
  const options: Record<string, any> = {};

  if (withWeakCollation) {
    options.collation = { locale: 'fr', strength: 1 };
  }
  // ---- aggregate execution ----//
  const query = await collection.aggregate(pipeline, options).toArray();

  return query;
};
