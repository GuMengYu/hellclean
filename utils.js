import fs from 'node:fs';
import path from 'node:path';

/**
 * 扫描指定目录下的所有 node_modules 文件夹
 * @param {string} dir - 要扫描的根目录
 * @returns {string[]} - 返回找到的 node_modules 文件夹的路径
 */
function findNodeModulesFolders(dir) {
  let nodeModulesPaths = [];

  // 尝试访问目录
  try {
    // 检查当前路径是否是文件夹
    if (!fs.existsSync(dir) || !fs.lstatSync(dir).isDirectory()) {
      return nodeModulesPaths;
    }

    // 读取当前目录中的所有文件和文件夹
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);

      // 如果找到 node_modules 文件夹，添加到结果数组
      if (file === 'node_modules' && fs.lstatSync(fullPath).isDirectory()) {
        nodeModulesPaths.push(fullPath);
      }

      // 如果是文件夹，递归遍历子文件夹，跳过 node_modules
      if (fs.lstatSync(fullPath).isDirectory() && file !== 'node_modules') {
        nodeModulesPaths = nodeModulesPaths.concat(findNodeModulesFolders(fullPath));
      }
    }
  } catch (err) {
    // 如果遇到权限问题，跳过这个目录
    if (err.code === 'EACCES') {
      console.warn(`Skipping directory due to lack of permissions: ${dir}`);
    } else {
      console.error(`Error processing directory ${dir}:`, err);
    }
  }

  return nodeModulesPaths;
}


function deleteDirectory(dirPath) {
  try {
    // 递归删除整个目录及其内容
    // 计算大小
    const size = getDirectorySize(dirPath)

    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`Directory ${dirPath} and all its contents have been deleted. Clean size ${formatBytes(size)}`);
    return size;
  } catch (err) {
    console.error(`Error while deleting directory ${dirPath}:`, err);
  }
}
function getDirectorySize(dirPath) {
  let totalSize = 0;

  try {
    const files = fs.readdirSync(dirPath, () => {});  // 读取目录内容
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stats = fs.lstatSync(fullPath);  // 获取文件或文件夹状态
      if (stats.isDirectory()) {
        // 如果是文件夹，递归计算大小
        totalSize += getDirectorySize(fullPath);
      } else {
        // 如果是文件，累加文件大小
        totalSize += stats.size;
      }
    }
  } catch (err) {
    console.error(`Error getting size of directory ${dirPath}:`, err);
  }
  return totalSize;
}


/**
 * 将字节数转换为合适的单位（KB、MB、GB等）
 * @param {number} bytes - 字节数
 * @param {number} decimals - 保留的小数位数（默认为2）
 * @returns {string} - 返回格式化后的字符串
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export {
  findNodeModulesFolders,
  deleteDirectory,
  formatBytes,
  getDirectorySize,
}