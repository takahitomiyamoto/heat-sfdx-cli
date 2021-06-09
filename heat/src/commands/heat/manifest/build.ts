import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import path = require('path');
import { writeFileSyncUtf8 } from 'heat-sfdx-common';
import { buildManifest } from 'heat-sfdx-metadata';

const DEFAULT = {
  ENVIRONMENT: 'config/environment.json',
  MANIFEST: 'manifest/package.xml',
  METADATA_WSDL: 'config/metadata.wsdl'
};

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('heat-sfdx-cli', 'build');

export default class HeatManifestBuild extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');

  public static examples = [
    `$ sfdx heat:manifest:build -u myOrg@example.com --apiversion 51.0 -x manifest/package.xml -w config/metadata.wsdl -e config/environment.json`
  ];

  public static args = [{ name: 'file' }];

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    apiversion: flags.builtin(),
    environment: flags.string({
      char: 'e',
      description: messages.getMessage('environmentFlagDescription')
    }),
    manifest: flags.string({
      char: 'x',
      description: messages.getMessage('manifestFlagDescription')
    }),
    wsdl: flags.string({
      char: 'w',
      description: messages.getMessage('wsdlFlagDescription')
    })
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Comment this out if your command does not support a hub org username
  // protected static supportsDevhubUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<AnyJson> {
    // const name = this.flags.name || 'world';

    // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
    const conn = this.org.getConnection();

    // parameters required
    if (!this.flags.apiversion) {
      throw new SfdxError(messages.getMessage('errorNoApiversion'));
    }

    // buildManifest
    const environmentFile = this.flags.environment || DEFAULT.ENVIRONMENT;
    const manifestFile = this.flags.manifest || DEFAULT.MANIFEST;
    const metadataWsdlFile = this.flags.wsdl || DEFAULT.METADATA_WSDL;

    const environment = require(path.join(
      __dirname,
      path.relative(__dirname, environmentFile)
    ));

    const authorization = {
      // @ts-ignore
      accessToken: conn.accessToken,
      // @ts-ignore
      instanceUrl: `${conn.instanceUrl}/services/Soap/m/${this.flags.apiversion}`,
      options: {
        asOfVersion: this.flags.apiversion,
        wsdl: {
          metadata: metadataWsdlFile
        }
      }
    };
    const config = {
      // TODO: 管理パッケージを含めるフラグ項目
      // TODO: Childrenを含めるフラグ項目
      metadataTypesNoFolder: environment.logs.metadataTypesNoFolder,
      metadataTypesInFolder: environment.logs.metadataTypesInFolder,
      metadataTypesFolder: environment.logs.metadataTypesFolder,
      root: environment.logs.root,
      manifest: manifestFile,
      asOfVersion: this.flags.apiversion,
      prefix: {
        metadataTypeMembers: environment.logs.prefix.metadataTypeMembers,
        listMetadata: environment.logs.prefix.listMetadata
      }
    };
    const buildManifestResult = await buildManifest(authorization, config);

    // archive
    writeFileSyncUtf8(manifestFile, buildManifestResult);
    const outputString = `${manifestFile} was created.`;
    console.log('');
    console.log(outputString);

    // Return an object to be displayed with --json
    return { orgId: this.org.getOrgId(), outputString };
  }
}
