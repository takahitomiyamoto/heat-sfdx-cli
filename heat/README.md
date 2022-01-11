# heat-sfdx-cli

This is a Salesforce CLI plug-In, which uses features of the heat-sfdx series.

[![Version](https://img.shields.io/npm/v/heat-sfdx-cli.svg)](https://npmjs.org/package/heat-sfdx-cli)
[![CircleCI](https://circleci.com/gh/takahitomiyamoto/heat-sfdx-cli/tree/master.svg?style=shield)](https://circleci.com/gh/takahitomiyamoto/heat-sfdx-cli/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/takahitomiyamoto/heat-sfdx-cli?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/heat-sfdx-cli/branch/master)
[![Codecov](https://codecov.io/gh/takahitomiyamoto/heat-sfdx-cli/branch/master/graph/badge.svg)](https://codecov.io/gh/takahitomiyamoto/heat-sfdx-cli)
[![Greenkeeper](https://badges.greenkeeper.io/takahitomiyamoto/heat-sfdx-cli.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/takahitomiyamoto/heat-sfdx-cli/badge.svg)](https://snyk.io/test/github/takahitomiyamoto/heat-sfdx-cli)
[![Downloads/week](https://img.shields.io/npm/dw/heat-sfdx-cli.svg)](https://npmjs.org/package/heat-sfdx-cli)
[![License](https://img.shields.io/npm/l/heat-sfdx-cli.svg)](https://github.com/takahitomiyamoto/heat-sfdx-cli/blob/master/package.json)

## heat-sfdx series

| category     | package                                                                      |
| :----------- | :--------------------------------------------------------------------------- |
| Metadata API | [heat-sfdx-metadata](https://github.com/takahitomiyamoto/heat-sfdx-metadata) |
| SOAP API     | [heat-sfdx-soap](https://github.com/takahitomiyamoto/heat-sfdx-soap)         |
| Tooling API  | [heat-sfdx-tooling](https://github.com/takahitomiyamoto/heat-sfdx-tooling)   |
| Common       | [heat-sfdx-common](https://github.com/takahitomiyamoto/heat-sfdx-common)     |

## How to install

```sh
sfdx plugins:install heat-sfdx-cli
# git clone https://github.com/takahitomiyamoto/heat-sfdx-cli.git
# cd heat-sfdx-cli/heat
# sfdx plugins:link
```

<!-- toc -->

- [heat-sfdx-cli](#heat-sfdx-cli)
- [git clone https://github.com/takahitomiyamoto/heat-sfdx-cli.git](#git-clone-httpsgithubcomtakahitomiyamotoheat-sfdx-cligit)
- [cd heat-sfdx-cli/heat](#cd-heat-sfdx-cliheat)
- [sfdx plugins:link](#sfdx-pluginslink)
- [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->

<!-- install -->

<!-- usage -->

```sh-session
$ npm install -g heat-sfdx-cli
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
heat-sfdx-cli/0.2.1 darwin-x64 node-v16.13.1
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```

<!-- usagestop -->
<!-- commands -->

- [`sfdx heat:manifest:build [-e <string>] [-x <string>] [-w <string>] [--beta] [--deleted] [--deprecated] [--deprecatededitable] [--installed] [--installededitable] [--released] [--unmanaged] [--standard] [--recommended] [--all] [--child] [-u <string>] [--apiversion <string>] [--verbose] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-heatmanifestbuild--e-string--x-string--w-string---beta---deleted---deprecated---deprecatededitable---installed---installededitable---released---unmanaged---standard---recommended---all---child--u-string---apiversion-string---verbose---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx heat:org [-n <string>] [-f] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-heatorg--n-string--f--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx heat:spec:apex:build [-e <string>] [-o <string>] [-u <string>] [--apiversion <string>] [--verbose] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-heatspecapexbuild--e-string--o-string--u-string---apiversion-string---verbose---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx heat:manifest:build [-e <string>] [-x <string>] [-w <string>] [--beta] [--deleted] [--deprecated] [--deprecatededitable] [--installed] [--installededitable] [--released] [--unmanaged] [--standard] [--recommended] [--all] [--child] [-u <string>] [--apiversion <string>] [--verbose] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

build manifest file with all metadata types in your org

```
USAGE
  $ sfdx heat:manifest:build [-e <string>] [-x <string>] [-w <string>] [--beta] [--deleted] [--deprecated]
  [--deprecatededitable] [--installed] [--installededitable] [--released] [--unmanaged] [--standard] [--recommended]
  [--all] [--child] [-u <string>] [--apiversion <string>] [--verbose] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -e, --environment=environment                                                     [default: config/environment.json]
                                                                                    environment file

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -w, --wsdl=wsdl                                                                   [default: config/metadata.wsdl]
                                                                                    Metadata API WSDL file

  -x, --manifest=manifest                                                           [default: manifest/package.xml]
                                                                                    manifest file

  --all                                                                             set this flag if you would like to
                                                                                    contain any all components

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --beta                                                                            set this flag if you would like to
                                                                                    contain any beta components

  --child                                                                           set this flag if you would like to
                                                                                    contain any child sub-components

  --deleted                                                                         set this flag if you would like to
                                                                                    contain any deleted components

  --deprecated                                                                      set this flag if you would like to
                                                                                    contain any deprecated components

  --deprecatededitable                                                              set this flag if you would like to
                                                                                    contain any deprecatedEditable
                                                                                    components

  --installed                                                                       set this flag if you would like to
                                                                                    contain any installed components

  --installededitable                                                               set this flag if you would like to
                                                                                    contain any installedEditable
                                                                                    components

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

  --recommended                                                                     set this flag if you would like to
                                                                                    contain any standard, unmanaged, and
                                                                                    child sub-components

  --released                                                                        set this flag if you would like to
                                                                                    contain any released components

  --standard                                                                        set this flag if you would like to
                                                                                    contain any standard components

  --unmanaged                                                                       set this flag if you would like to
                                                                                    contain any unmanaged components

  --verbose                                                                         emit additional command output to
                                                                                    stdout

EXAMPLES

  [standard and unmanaged components]
  $ sfdx heat:manifest:build --apiversion 52.0 -u myOrg@example.com --standard --unmanaged

  [standard, unmanaged and unlocked components]
  $ sfdx heat:manifest:build --apiversion 52.0 -u myOrg@example.com --standard --unmanaged --installededitable

  [standard, unmanaged and child sub-components]
  $ sfdx heat:manifest:build --apiversion 52.0 -u myOrg@example.com --recommended

  [standard, unmanaged, unlocked, managed and child sub-components]
  $ sfdx heat:manifest:build --apiversion 52.0 -u myOrg@example.com --all
```

_See code: [src/commands/heat/manifest/build.ts](https://github.com/takahitomiyamoto/heat-sfdx-cli/blob/v0.2.1/src/commands/heat/manifest/build.ts)_

## `sfdx heat:org [-n <string>] [-f] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

print a greeting and your org IDs

```
USAGE
  $ sfdx heat:org [-n <string>] [-f] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --force                                                                       example boolean flag
  -n, --name=name                                                                   name to print

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -v, --targetdevhubusername=targetdevhubusername                                   username or alias for the dev hub
                                                                                    org; overrides default dev hub org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx hello:org --targetusername myOrg@example.com --targetdevhubusername devhub@org.com
    Hello world! This is org: MyOrg and I will be around until Tue Mar 20 2018!
    My hub org id is: 00Dxx000000001234

  $ sfdx hello:org --name myname --targetusername myOrg@example.com
    Hello myname! This is org: MyOrg and I will be around until Tue Mar 20 2018!
```

_See code: [src/commands/heat/org.ts](https://github.com/takahitomiyamoto/heat-sfdx-cli/blob/v0.2.1/src/commands/heat/org.ts)_

## `sfdx heat:spec:apex:build [-e <string>] [-o <string>] [-u <string>] [--apiversion <string>] [--verbose] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

build any specification documents of Apex classes or triggers in markdown format

```
USAGE
  $ sfdx heat:spec:apex:build [-e <string>] [-o <string>] [-u <string>] [--apiversion <string>] [--verbose] [--json]
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -e, --environment=environment                                                     [default: config/environment.json]
                                                                                    environment file

  -o, --output=output                                                               [default: docs] output directory

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

  --verbose                                                                         emit additional command output to
                                                                                    stdout

EXAMPLE

  $ sfdx heat:spec:apex:build --apiversion 52.0 -u myOrg@example.com -o docs
```

_See code: [src/commands/heat/spec/apex/build.ts](https://github.com/takahitomiyamoto/heat-sfdx-cli/blob/v0.2.1/src/commands/heat/spec/apex/build.ts)_

<!-- commandsstop -->
<!-- debugging-your-plugin -->

# Debugging your plugin

We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `hello:org` command:

1. Start the inspector

If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch:

```sh
$ sfdx hello:org -u myOrg@example.com --dev-suspend
```

Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:

```sh
$ NODE_OPTIONS=--inspect-brk bin/run hello:org -u myOrg@example.com
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program.
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
   <br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
   Congrats, you are debugging!
