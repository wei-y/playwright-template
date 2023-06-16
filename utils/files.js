const path = require("path");
const JSZip = require("jszip");
const fs = require("fs/promises");
const csvParser = require("csv-parse/sync");
const crypto = require("crypto");

/**
 * Read CSV file and returns its content as array of objects.
 *
 * It skips first line because it is classification line not headers
 *
 * @param {String} csvFile - path to the CSV file
 * @returns {Object[]} - An array of rows with columns name as keys and content
 *    as values
 */
async function loadCSV(csvFile) {
  console.log(`Loading CSV file ${csvFile}`);

  // read file
  const data = await fs.readFile(csvFile);
  // parse data:
  //   1. from line 2 skipping classification
  //   2. skip line w/o name
  const parsed = csvParser.parse(data, {
    columns: true,
    from_line: 2,
    on_record: (record) => (record.Name ? record : null),
  });
  return parsed;
}

/**
 * Calculate hash value of a string using SHA3-256
 * @param {String} data - the data to be calculated
 * @returns {String} - Hash string in hex format
 */
function stringHash(data) {
  console.log(`Calculating hash of string`);

  const algorithm = "sha3-256";
  const shasum = crypto.createHash(algorithm);
  shasum.update(data);
  return shasum.digest("hex");
}

/**
 * Calculate file hash value using SHA3-256
 * @param {String} fname - the name of file to be calculated
 * @returns {String} - Hash string in hex format
 */
async function fileHash(fname) {
  console.log(`Calculating hash of ${fname}`);
  const data = await fs.readFile(fname);
  return stringHash(data);
}

/**
 * Unzip a file
 * @param {String} zip - the zip file to be unpacked
 * @param {String} targetPath - the place to unpack the file
 * @return {String} - manifest file path relative to target dir
 */
async function unzipFile(zipFile, targetPath) {
  console.log(`unzip file ${zipFile} to ${targetPath}`);

  // read zip binary
  const zipData = await fs.readFile(zipFile);

  // load zip binary as object
  const zip = new JSZip();
  const zipObj = await zip.loadAsync(zipData);

  // re-create target path is non existing
  if (await fs.stat(targetPath).catch((e) => false)) {
    await fs.rm(targetPath, { recursive: true });
  }
  await fs.mkdir(targetPath, { recursive: true });

  // write each file to target
  let manifest;
  const files = Object.keys(zipObj.files);
  for (const fname of files) {
    // read file content
    const content = await zip.file(fname).async("nodebuffer");
    // write to dest
    const dest = path.join(targetPath, fname);
    const dirname = path.dirname(dest);
    await fs.mkdir(dirname, { recursive: true });
    await fs.writeFile(dest, content);
    if (fname.endsWith("_manifest.csv")) {
      manifest = fname;
    }
  }
  return manifest;
}

async function removeEmptyDirectories(directory) {
  // lstat does not follow symlinks (in contrast to stat)
  const fileStats = await fs.lstat(directory);
  if (!fileStats.isDirectory()) {
    return;
  }
  let fileNames = await fs.readdir(directory);
  if (fileNames.length > 0) {
    const recursiveRemovalPromises = fileNames.map((fileName) =>
      removeEmptyDirectories(path.join(directory, fileName))
    );
    await Promise.all(recursiveRemovalPromises);

    // re-evaluate fileNames; after deleting subdirectory
    // we may have parent directory empty now
    fileNames = await fs.readdir(directory);
  }

  if (fileNames.length === 0) {
    console.log("Removing: ", directory);
    await fs.rm(directory, { recursive: true });
  }
}

module.exports = {
  unzipFile,
  loadCSV,
  stringHash,
  fileHash,
  removeEmptyDirectories,
};
