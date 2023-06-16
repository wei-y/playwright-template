const path = require("path");
const SSH2Promise = require("ssh2-promise");
const SFTPClient = require("ssh2-sftp-client");

// TODO: remove this file after all datasets tests are E2E
/**
 * Run ssh command in remote host
 * @param {Object} config - configurations to connect to the host
 * @param {String} config.host - host name or address
 * @param {String} config.username - username
 * @param {String} config.identity - path to key file
 * @param {String} config.password - user password
 * @param {String} remotePath - the remote path to run the command
 * @param {String} command - the command to be run
 * @param {String[]} cmdOptions - options to the command to be run
 * @returns {String} - The console output, combining stdout and stderr
 */
async function runSSHCmd(config, remotePath, command, cmdOptions) {
  console.log(`SSH connecting to ${config.host}`);
  console.log(`Go to path: ${remotePath}`);
  const options = cmdOptions ? cmdOptions.join(" ") : "";
  console.log(`Run command: ${command} ${options}\n\n`);
  const ssh = new SSH2Promise(config);

  // get the internal SSHConnection object
  const conn = await ssh.getSSHConnection(ssh.config[0], false);
  const toRun = `cd ${remotePath} && ${command} ${options}`;

  // HACK: customised exec behavior
  // SSH2Promise.exec() will fail on stderr which is too strict.
  // the following is copied from source of SSH2Promise.exec()
  // replacing .stderr.on('data', ...) with appending data
  // eslint-disable-next-line max-len
  // https://github.com/sanketbajoria/ssh2-promise/blob/master/src/sshConnection.ts
  const execPromise = conn.connect().then(
    () =>
      new Promise((resolve, reject) => {
        conn.sshConnection.exec(toRun, {}, (err, stream) => {
          if (err) {
            return reject(err);
          }
          let buffer = "";
          stream
            .on("close", () => resolve(buffer))
            .on("data", (data) => {
              buffer += data.toString();
            })
            .stderr.on("data", (data) => {
              buffer += data;
            });
          return null;
        });
      })
  );

  // await the execPromise to resolve and return the result
  let result = null;

  try {
    result = await execPromise;
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    await ssh.close();
  }
  console.log(result);
  console.log("==> Done!");
  return result;
}

/**
 * Copy file or buffer to remote host using sftp
 * @param {Object} config - configurations to connect to remote host
 * @param {String|Buffer} src - source file path or buffer to copy to remote
 * @param {String} remoteDir - remote path
 * @param {String} remoteFile - remote file name
 */
async function copyToRemote(config, src, remoteDir, remoteFile) {
  const sftp = new SFTPClient();
  await sftp.connect(config);
  await sftp.mkdir(remoteDir, true);
  const dst = path.posix.join(remoteDir, remoteFile);
  await sftp.put(src, dst);
  await sftp.end();
}

module.exports = {
  runSSHCmd,
  copyToRemote,
};
