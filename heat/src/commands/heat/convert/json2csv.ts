import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import path = require('path');
import {
  existsSync,
  mkdirSync,
  readFileSyncUtf8,
  rmSync,
  writeFileSyncUtf8,
  json2csv
} from 'heat-sfdx-common';

const DEFAULT = {
  ENVIRONMENT: 'config/environment.json',
  HAS_HEADER: true,
  CHARCODE: 'utf8',
  KEYS: 'Profile.applicationVisibilities'
};

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
// TODO 共通のメッセージを別ファイルに分割
const messages = Messages.loadMessages('heat-sfdx-cli', 'convert');

export default class HeatConvertJson2csv extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');

  public static examples = [
    `\n$ sfdx heat:convert:json2csv --header -k Profile.classAccesses -i .heat-logs/input.json -o .heat-logs/output.csv`
  ];

  public static args = [{ name: 'file' }];

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    environment: flags.string({
      char: 'e',
      description: messages.getMessage('environmentFlagDescription')
    }),
    inputfile: flags.string({
      char: 'i',
      description: messages.getMessage('inputFileFlagDescription')
    }),
    outputfile: flags.string({
      char: 'o',
      description: messages.getMessage('outputFileFlagDescription')
    }),
    header: flags.boolean({
      description: messages.getMessage('hasHeaderFlagDescription')
    }),
    charcode: flags.string({
      char: 'c',
      description: messages.getMessage('charCodeFlagDescription')
    }),
    keys: flags.string({
      char: 'k',
      description: messages.getMessage('keysFlagDescription')
    }),
    verbose: flags.builtin()
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = false;

  // Comment this out if your command does not support a hub org username
  // protected static supportsDevhubUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<AnyJson> {
    // TODO: 関数に分割

    this.ux.startSpinner(messages.getMessage('infoCheckFlags'));

    // parameters required
    if (!this.flags.inputfile) {
      throw new SfdxError(messages.getMessage('errorNoInputFile'));
    }
    if (!this.flags.outputfile) {
      throw new SfdxError(messages.getMessage('errorNoOutputFile'));
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

    const inputFile = this.flags.inputfile;
    const inputFileObj = readFileSyncUtf8(inputFile);

    const outputFile = this.flags.outputfile;
    rmSync(`${outputFile}`, { recursive: false, force: true });

    const hasHeader = this.flags.header || DEFAULT.HAS_HEADER;

    this.ux.stopSpinner(this.ux.getSpinnerStatus());
    this.ux.startSpinner(
      `${messages.getMessage(
        'infoAwaitExecute'
      )}: \n [in] ${inputFile}\n [out] ${outputFile}\n`
    );

    // convert
    const rawKeys = this.flags.keys || DEFAULT.KEYS;
    const keys = rawKeys.split('.');
    const charCode: BufferEncoding = this.flags.charcode || DEFAULT.CHARCODE;
    const params = {
      jsonString: inputFileObj,
      csvFile: outputFile,
      charCode: charCode,
      hasHeader: hasHeader,
      keys: keys
    };
    const result = await json2csv(params);

    this.ux.stopSpinner(this.ux.getSpinnerStatus());

    // archive
    writeFileSyncUtf8(`${outputFile}`, JSON.stringify(result));

    // Return an object to be displayed with --json
    return { orgId: '' };
  }
}
