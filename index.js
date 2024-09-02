// 
import prompts from 'prompts';
import { findNodeModulesFolders, deleteDirectory, formatBytes } from './utils.js'
import os from 'node:os';
import yargs from 'yargs';
import ora from 'ora';

prompts.override(yargs.argv);

const spinner = ora({
    text: '扫描node_modules目录',
    spinner: 'simpleDots'
  }
);


/**
 * 扫描指定目录下的所有 node_modules 文件夹
 * @param {string} dir - 要扫描的根目录
 * @returns {string[]} - 返回找到的 node_modules 文件夹的路径
 */

(async () => {

  let freeSize = 0;
  const rootPathRes = await prompts({
    type: 'text',
    name: 'rootPath',
    message: `Which path would you like to clean?`,
    initial: `${os.homedir()}/data/code`
  })

  const rootPath = rootPathRes.rootPath;


  spinner.start();
  const node_modules_paths = findNodeModulesFolders(rootPath)
  spinner.stop();

  const response = await prompts([
    {
      type: 'multiselect',
      name: 'paths',
      message: 'Pick the node_modules paths to delete',
      choices: node_modules_paths.map(i => ({
        title: i, value: i
      })),
    }
  ]);

  const { paths } = response;
  
  if (!paths) {
    process.exit(0)
  }

  // 遍历paths 并删除
  for (const path of paths) {
    const deleteSize = deleteDirectory(path)
    if (deleteSize) {
      freeSize += deleteSize
    }
  }
  console.log(`Done, You already clean ${paths.length} node_modules directories, Clean size ${formatBytes(freeSize)}`);
  process.exit(0)
})();
