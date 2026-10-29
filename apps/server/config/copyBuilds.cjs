const fs = require('fs-extra');
const wait = require('util').promisify(setTimeout);
/**
 * @NOTE it's also defined here "../src/utils/constants" (twice)
 * but it's not available here, so I'm defining it for the second time here (because of different env, ts and js)
 * so if it will be changed here, it should be changed there too
 */
const BO_BUILD_FOLDERS = {
  preprod: 'clientBuild/bo/preprod',
  prod: 'clientBuild/bo/prod',
};

/**
 * copy the client build to the server build
 * @NOTE see the script in package.json (yarn copy)
 * when copying the files, the directories in local should follow the following structure and name:
 * /bo
 * /server
 */
const run = async () => {
	const clientFolder = process.env.NODE_ENV === 'production' ? BO_BUILD_FOLDERS.prod : BO_BUILD_FOLDERS.preprod;
	//---- client ----//
	console.log('copying client build in : ', clientFolder, ' for ', process.env.NODE_ENV || 'development');
	// remove the old one if exists
	await fs.remove(`./${clientFolder}`);
	await wait(1000);
	// check if the client build folder exists
	await fs.ensureDir('../bo');
	// copy the client build to the server build
	await fs.copy('../bo/dist', `./${clientFolder}`);
	console.log('Done');
}

run();