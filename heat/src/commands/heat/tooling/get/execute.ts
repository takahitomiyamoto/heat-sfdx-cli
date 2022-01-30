import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import path = require('path');
import {
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSyncUtf8
} from 'heat-sfdx-common';
import { executeGet } from 'heat-sfdx-tooling';

const DEFAULT = {
  ENVIRONMENT: 'config/environment.json',
  OUTPUT_DIR: '.logs',
  OUTPUT_FILE: 'result.txt',
  URL: '/tooling/sobjects'
};

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
// TODO 共通のメッセージを別ファイルに分割
const messages = Messages.loadMessages('heat-sfdx-cli', 'tooling');

export default class HeatToolingGetExecute extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');

  public static examples = [
    `\n$ sfdx heat:tooling:get:execute --apiversion 54.0 -u myOrg@example.com -d .logs -f result.txt -r /tooling/sobjects/Profile/describe`
  ];

  public static args = [{ name: 'file' }];

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    apiversion: flags.builtin(),
    environment: flags.string({
      char: 'e',
      description: messages.getMessage('environmentFlagDescription')
    }),
    outputdir: flags.string({
      char: 'd',
      description: messages.getMessage('outputDirFlagDescription')
    }),
    outputfile: flags.string({
      char: 'f',
      description: messages.getMessage('outputFileFlagDescription')
    }),
    url: flags.string({
      char: 'r',
      description: messages.getMessage('urlFlagDescription')
    }),
    verbose: flags.builtin()
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Comment this out if your command does not support a hub org username
  // protected static supportsDevhubUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<AnyJson> {
    // TODO: 関数に分割

    this.ux.startSpinner(messages.getMessage('infoGetConnection'));
    // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
    const conn = this.org.getConnection();

    this.ux.stopSpinner(this.ux.getSpinnerStatus());
    this.ux.startSpinner(messages.getMessage('infoCheckFlags'));

    // parameters required
    if (!this.flags.apiversion) {
      throw new SfdxError(messages.getMessage('errorNoApiversion'));
    }

    const environmentFile = this.flags.environment || DEFAULT.ENVIRONMENT;

    if (!existsSync(environmentFile)) {
      this.ux.pauseSpinner(() => {
        this.ux.startSpinner(
          `${messages.getMessage('infoCreateEnvironment')}: ${environmentFile}`
        );
        writeFileSyncUtf8(
          environmentFile,
          messages.getMessage('jsonEnvironment')
        );
        this.ux.stopSpinner(this.ux.getSpinnerStatus());
      }, messages.getMessage('errorInvalidEnvironment'));
    }

    const environment = require(path.join(
      __dirname,
      path.relative(__dirname, environmentFile)
    ));

    // rm -rf .heat-logs/
    rmSync(environment.logs.root, { recursive: true, force: true });
    // mkdir .heat-logs/
    mkdirSync(environment.logs.root);

    this.ux.stopSpinner(this.ux.getSpinnerStatus());

    const outputDir = this.flags.outputdir || DEFAULT.OUTPUT_DIR;
    // rm -rf .logs/
    rmSync(outputDir, { recursive: true, force: true });
    // mkdir .logs/
    mkdirSync(outputDir);

    const outputFile = this.flags.outputfile || DEFAULT.OUTPUT_FILE;
    // rm .logs/result.txt
    rmSync(`${outputDir}/${outputFile}`, { recursive: false, force: true });

    const url = this.flags.url || DEFAULT.URL;

    this.ux.stopSpinner(this.ux.getSpinnerStatus());
    this.ux.startSpinner(
      `${messages.getMessage('infoAwaitExecute')}: ${outputDir}/${outputFile}`
    );

    const authorization = {
      // @ts-ignore
      accessToken: conn.accessToken,
      // @ts-ignore
      instanceUrl: conn.instanceUrl,
      options: {
        asOfVersion: this.flags.apiversion,
        environment: environment,
        outputDir: outputDir,
        outputFile: outputFile,
        url: url,
        verbose: this.flags.verbose
      }
    };

    // execute
    await executeGet(authorization);

    const executeGetResult = await executeGet(authorization);
    this.ux.stopSpinner(this.ux.getSpinnerStatus());

    // archive
    writeFileSyncUtf8(`${outputDir}/${outputFile}`, executeGetResult);

    // Return an object to be displayed with --json
    return { orgId: this.org.getOrgId() };
  }
}
