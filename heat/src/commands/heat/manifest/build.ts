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
import { buildManifest } from 'heat-sfdx-metadata';

const DEFAULT = {
  ENVIRONMENT: 'config/environment.json',
  MANIFEST: 'manifest/package.xml',
  MANIFEST_DIR: 'manifest',
  METADATA_WSDL: 'config/metadata.wsdl'
};

const MANAGEABLE_STATE = {
  UNDEFINED: undefined,
  BETA: 'beta',
  DELETED: 'deleted',
  DEPRECATED: 'deprecated',
  DEPRECATED_EDITABLE: 'deprecatedEditable',
  INSTALLED: 'installed',
  INSTALLED_EDITABLE: 'installedEditable',
  RELEASED: 'released',
  UNMANAGED: 'unmanaged'
};

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('heat-sfdx-cli', 'manifest-build');

export default class HeatManifestBuild extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');

  public static examples = [
    `\n[standard and unmanaged components] \n$ sfdx heat:manifest:build --apiversion 52.0 -u myOrg@example.com --standard --unmanaged`,
    `\n[standard, unmanaged and unlocked components] \n$ sfdx heat:manifest:build --apiversion 52.0 -u myOrg@example.com --standard --unmanaged --installededitable`,
    `\n[standard, unmanaged and child sub-components] \n$ sfdx heat:manifest:build --apiversion 52.0 -u myOrg@example.com --recommended`,
    `\n[standard, unmanaged, unlocked, managed and child sub-components] \n$ sfdx heat:manifest:build --apiversion 52.0 -u myOrg@example.com --all`
  ];

  public static args = [{ name: 'file' }];

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    apiversion: flags.builtin(),
    verbose: flags.builtin(),
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
    beta: flags.boolean({
      description: messages.getMessage('betaFlagDescription')
    }),
    deleted: flags.boolean({
      description: messages.getMessage('deletedFlagDescription')
    }),
    deprecated: flags.boolean({
      description: messages.getMessage('deprecatedFlagDescription')
    }),
    deprecatededitable: flags.boolean({
      description: messages.getMessage('deprecatededitableFlagDescription')
    }),
    installed: flags.boolean({
      description: messages.getMessage('installedFlagDescription')
    }),
    installededitable: flags.boolean({
      description: messages.getMessage('installededitableFlagDescription')
    }),
    released: flags.boolean({
      description: messages.getMessage('releasedFlagDescription')
    }),
    unmanaged: flags.boolean({
      description: messages.getMessage('unmanagedFlagDescription')
    }),
    standard: flags.boolean({
      description: messages.getMessage('standardFlagDescription')
    }),
    recommended: flags.boolean({
      description: messages.getMessage('recommendedFlagDescription')
    }),
    all: flags.boolean({
      description: messages.getMessage('allFlagDescription')
    }),
    child: flags.boolean({
      description: messages.getMessage('childFlagDescription')
    })
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

    if (this.flags.recommended) {
      this.flags.unmanaged = true;
      this.flags.standard = true;
      this.flags.child = true;
    }
    if (this.flags.all) {
      this.flags.beta = true;
      this.flags.deleted = true;
      this.flags.deprecated = true;
      this.flags.deprecatedEditable = true;
      this.flags.installed = true;
      this.flags.installedEditable = true;
      this.flags.released = true;
      this.flags.unmanaged = true;
      this.flags.standard = true;
      this.flags.child = true;
    }

    const manageableStates = [];
    if (this.flags.beta) {
      manageableStates.push(MANAGEABLE_STATE.BETA);
    }
    if (this.flags.deleted) {
      manageableStates.push(MANAGEABLE_STATE.DELETED);
    }
    if (this.flags.deprecated) {
      manageableStates.push(MANAGEABLE_STATE.DEPRECATED);
    }
    if (this.flags.deprecatedEditable) {
      manageableStates.push(MANAGEABLE_STATE.DEPRECATED_EDITABLE);
    }
    if (this.flags.installed) {
      manageableStates.push(MANAGEABLE_STATE.INSTALLED);
    }
    if (this.flags.installedEditable) {
      manageableStates.push(MANAGEABLE_STATE.INSTALLED_EDITABLE);
    }
    if (this.flags.released) {
      manageableStates.push(MANAGEABLE_STATE.RELEASED);
    }
    if (this.flags.unmanaged) {
      manageableStates.push(MANAGEABLE_STATE.UNMANAGED);
    }
    if (this.flags.standard) {
      manageableStates.push(MANAGEABLE_STATE.UNDEFINED);
    }

    // buildManifest
    const environmentFile = this.flags.environment || DEFAULT.ENVIRONMENT;
    const manifestFile = this.flags.manifest || DEFAULT.MANIFEST;
    const metadataWsdlFile = this.flags.wsdl || DEFAULT.METADATA_WSDL;

    // throw error if config files do not exist
    if (!existsSync(metadataWsdlFile)) {
      throw new SfdxError(messages.getMessage('errorInvalidMetadataWsdl'));
    }

    if (!existsSync(manifestFile)) {
      this.ux.pauseSpinner(() => {
        this.ux.startSpinner(
          `${messages.getMessage('infoCreateManifest')}: ${manifestFile}`
        );
        const hasDir = existsSync(
          path.join(__dirname, path.relative(__dirname, DEFAULT.MANIFEST_DIR))
        );
        if (!hasDir) {
          mkdirSync(DEFAULT.MANIFEST_DIR);
        }
        writeFileSyncUtf8(manifestFile, '');
        this.ux.stopSpinner(this.ux.getSpinnerStatus());
      }, messages.getMessage('errorInvalidManifest'));
    }

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
    this.ux.startSpinner(
      `${messages.getMessage('infoAwaitBuildManifest')}: ${manifestFile} `
    );

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
      asOfVersion: this.flags.apiversion,
      child: this.flags.child,
      metadataTypesFolder: environment.logs.metadataTypesFolder,
      manageableStates: manageableStates,
      manifest: manifestFile,
      listmetadata: environment.listmetadata,
      metadataTypesInFolder: environment.logs.metadataTypesInFolder,
      metadataTypesNoFolder: environment.logs.metadataTypesNoFolder,
      prefix: {
        metadataTypeMembers: environment.logs.prefix.metadataTypeMembers,
        listMetadata: environment.logs.prefix.listMetadata
      },
      root: environment.logs.root,
      verbose: this.flags.verbose
    };

    const buildManifestResult = await buildManifest(authorization, config);
    this.ux.stopSpinner(this.ux.getSpinnerStatus());

    // archive
    writeFileSyncUtf8(manifestFile, buildManifestResult);

    // Return an object to be displayed with --json
    return { orgId: this.org.getOrgId() };
  }
}
