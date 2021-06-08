import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import path = require('path');
import { writeFileSyncUtf8 } from 'heat-sfdx-common';
import { buildManifest } from 'heat-sfdx-metadata';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('heat-sfdx-cli', 'build');

export default class HeatManifestBuild extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');

  public static examples = [
    `$ sfdx heat:manifest:build -u myOrg@example.com -v 51.0 -x manifest/package.xml -w config/metadata.wsdl -e config/environment.json`
  ];

  public static args = [{ name: 'file' }];

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    version: flags.string({
      char: 'v',
      description: messages.getMessage('versionFlagDescription')
    }),
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
    }),
    force: flags.boolean({
      char: 'f',
      description: messages.getMessage('forceFlagDescription')
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
    const query = 'Select Name, TrialExpirationDate from Organization';

    // The type we are querying for
    interface Organization {
      Name: string;
      TrialExpirationDate: string;
    }

    // Query the org
    // @ts-ignore
    const result = await conn.query<Organization>(query);

    // Organization will always return one result, but this is an example of throwing an error
    // The output and --json will automatically be handled for you.
    if (!result.records || result.records.length <= 0) {
      throw new SfdxError(
        messages.getMessage('errorNoOrgResults', [this.org.getOrgId()])
      );
    }

    // buildManifest
    const ENVIRONMENT = this.flags.environment;

    const environment = require(path.join(
      __dirname,
      path.relative(__dirname, ENVIRONMENT)
    ));

    const authorization = {
      // @ts-ignore
      accessToken: conn.accessToken,
      // @ts-ignore
      instanceUrl: `${conn.instanceUrl}/services/Soap/m/${this.flags.version}`,
      options: {
        asOfVersion: this.flags.version,
        wsdl: {
          metadata: this.flags.wsdl
        }
      }
    };
    const config = {
      metadataTypesNoFolder: environment.logs.metadataTypesNoFolder,
      metadataTypesInFolder: environment.logs.metadataTypesInFolder,
      metadataTypesFolder: environment.logs.metadataTypesFolder,
      root: environment.logs.root,
      manifest: this.flags.manifest,
      asOfVersion: this.flags.version,
      prefix: {
        metadataTypeMembers: environment.logs.prefix.metadataTypeMembers,
        listMetadata: environment.logs.prefix.listMetadata
      }
    };
    const buildManifestResult = await buildManifest(authorization, config);

    // archive
    writeFileSyncUtf8(this.flags.manifest, buildManifestResult);
    const outputString = `${this.flags.manifest} was created.`;
    console.log('');
    console.log(outputString);

    // Return an object to be displayed with --json
    return { orgId: this.org.getOrgId(), outputString };
  }
}
