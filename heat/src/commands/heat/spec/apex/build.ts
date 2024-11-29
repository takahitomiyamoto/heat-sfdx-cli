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
import { buildApexClassSpecs, buildApexTriggerSpecs } from 'heat-sfdx-tooling';

const DEFAULT = {
  ENVIRONMENT: 'config/environment.json',
  OUTPUT_DIR: 'docs'
};

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('heat-sfdx-cli', 'spec-apex-build');
const messagesJsonEnv = Messages.loadMessages(
  'heat-sfdx-cli',
  'common-json-env'
);

export default class HeatSpecApexBuild extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');

  public static examples = [
    `\n$ sfdx heat:spec:apex:build --apiversion 57.0 -u myOrg@example.com -o docs`
  ];

  public static args = [{ name: 'file' }];

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    apiversion: flags.builtin(),
    environment: flags.string({
      char: 'e',
      description: messages.getMessage('environmentFlagDescription')
    }),
    output: flags.string({
      char: 'o',
      description: messages.getMessage('outputFlagDescription')
    }),
    verbose: flags.builtin()
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Comment this out if your command does not support a hub org username
  // protected static supportsDevhubUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  private checkFlags(): void {
    if (!this.flags.apiversion) {
      throw new SfdxError(messages.getMessage('errorNoApiversion'));
    }
  }

  private generateEnvFile(): any {
    const environmentFile = this.flags.environment || DEFAULT.ENVIRONMENT;

    if (!existsSync(environmentFile)) {
      this.ux.pauseSpinner(() => {
        this.ux.startSpinner(
          `${messages.getMessage('infoCreateEnvironment')}: ${environmentFile}`
        );
        writeFileSyncUtf8(
          environmentFile,
          messagesJsonEnv.getMessage('jsonEnv')
        );
        this.ux.stopSpinner(this.ux.getSpinnerStatus());
      }, messages.getMessage('errorInvalidEnvironment'));
    }

    const environment = require(
      path.join(__dirname, path.relative(__dirname, environmentFile))
    );

    return environment;
  }

  private resetFolders(environment: any, outputDir: string): void {
    // rm -rf .heat-logs/ and docs
    rmSync(environment.logs.root, { recursive: true, force: true });
    rmSync(outputDir, { recursive: true, force: true });

    // mkdir .heat-logs/
    mkdirSync(environment.logs.root);
    mkdirSync(environment.logs.apex.rawData);
    mkdirSync(environment.logs.apexClass.rawData);
    mkdirSync(environment.logs.apexClass.symbolTable);
    mkdirSync(environment.logs.apexTrigger.rawData);
    mkdirSync(environment.logs.apexTrigger.symbolTable);

    // mkdir docs/
    mkdirSync(outputDir);
    mkdirSync(`${outputDir}/apex-class`);
    mkdirSync(`${outputDir}/apex-trigger`);
  }

  public async run(): Promise<AnyJson> {
    // TODO: 関数に分割

    this.ux.startSpinner(messages.getMessage('infoGetConnection'));

    // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
    const conn = this.org.getConnection();

    this.ux.stopSpinner(this.ux.getSpinnerStatus());

    // parameters required
    this.ux.startSpinner(messages.getMessage('infoCheckFlags'));
    this.checkFlags();
    this.ux.stopSpinner(this.ux.getSpinnerStatus());

    const environment = this.generateEnvFile();
    const outputDir = this.flags.output || DEFAULT.OUTPUT_DIR;

    this.resetFolders(environment, outputDir);

    const authorization = {
      // @ts-ignore
      accessToken: conn.accessToken,
      // @ts-ignore
      instanceUrl: conn.instanceUrl,
      options: {
        asOfVersion: this.flags.apiversion,
        environment: environment,
        outputDir: {
          class: `${outputDir}/apex-class`,
          trigger: `${outputDir}/apex-trigger`
        },
        verbose: this.flags.verbose
      }
    };

    // generate spec docs of Apex Class
    this.ux.startSpinner(messages.getMessage('infoGenerateSpecsApexClass'));
    await buildApexClassSpecs(authorization);
    this.ux.stopSpinner(this.ux.getSpinnerStatus());

    // generate spec docs of Apex Trigger
    this.ux.startSpinner(messages.getMessage('infoGenerateSpecsApexTrigger'));
    await buildApexTriggerSpecs(authorization);
    this.ux.stopSpinner(this.ux.getSpinnerStatus());

    // generate home.md
    // TODO: LWC OSS のサンプルページのフォーマットを参考に

    // generate lwr.config.json
    // TODO

    // Return an object to be displayed with --json
    return { orgId: this.org.getOrgId() };
  }
}
