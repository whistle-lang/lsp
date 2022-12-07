"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateInlayHints = exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
const node_1 = require("vscode-languageclient/node");
let client;
// type a = Parameters<>;
async function activate(context) {
    let disposable = vscode_1.commands.registerCommand("helloworld.helloWorld", async (uri) => {
        vscode_1.window.activeTextEditor.document;
        let editor = vscode_1.window.activeTextEditor;
        let range = new vscode_1.Range(1, 1, 1, 1);
        editor.selection = new vscode_1.Selection(range.start, range.end);
    });
    context.subscriptions.push(disposable);
    const traceOutputChannel = vscode_1.window.createOutputChannel("Testwhistle Language Server trace");
    const command = process.env.SERVER_PATH || "whistle_lsp";
    const run = {
        command,
        options: {
            env: {
                ...process.env,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                RUST_LOG: "debug",
            },
        },
    };
    const serverOptions = {
        run,
        debug: run,
    };
    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    // Options to control the language client
    let clientOptions = {
        // Register the server for plain text documents
        documentSelector: [{ scheme: "file", language: "testwhistle" }],
        synchronize: {
            // Notify the server about file changes to '.clientrc files contained in the workspace
            fileEvents: vscode_1.workspace.createFileSystemWatcher("**/.clientrc"),
        },
        traceOutputChannel,
    };
    // Create the language client and start the client.
    client = new node_1.LanguageClient("whistle_lsp", "testwhistle language server", serverOptions, clientOptions);
    activateInlayHints(context);
    client.start();
}
exports.activate = activate;
function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
exports.deactivate = deactivate;
function activateInlayHints(ctx) {
    const maybeUpdater = {
        hintsProvider: null,
        updateHintsEventEmitter: new vscode_1.EventEmitter(),
        async onConfigChange() {
            this.dispose();
            const event = this.updateHintsEventEmitter.event;
            this.hintsProvider = vscode_1.languages.registerInlayHintsProvider({ scheme: "file", language: "testwhistle" }, new (class {
                constructor() {
                    this.onDidChangeInlayHints = event;
                }
                resolveInlayHint(hint, token) {
                    const ret = {
                        label: hint.label,
                        ...hint,
                    };
                    return ret;
                }
                async provideInlayHints(document, range, token) {
                    const hints = (await client
                        .sendRequest("custom/inlay_hint", { path: document.uri.toString() })
                        .catch(err => null));
                    if (hints == null) {
                        return [];
                    }
                    else {
                        return hints.map(item => {
                            const [start, end, label] = item;
                            let startPosition = document.positionAt(start);
                            let endPosition = document.positionAt(end);
                            return {
                                position: endPosition,
                                paddingLeft: true,
                                label: [
                                    {
                                        value: `${label}`,
                                        // location: {
                                        //   uri: document.uri,
                                        //   range: new Range(1, 0, 1, 0)
                                        // }
                                        command: {
                                            title: "hello world",
                                            command: "helloworld.helloWorld",
                                            arguments: [document.uri],
                                        },
                                    },
                                ],
                            };
                        });
                    }
                }
            })());
        },
        onDidChangeTextDocument({ contentChanges, document }) {
            // debugger
            // this.updateHintsEventEmitter.fire();
        },
        dispose() {
            var _a;
            (_a = this.hintsProvider) === null || _a === void 0 ? void 0 : _a.dispose();
            this.hintsProvider = null;
            this.updateHintsEventEmitter.dispose();
        },
    };
    vscode_1.workspace.onDidChangeConfiguration(maybeUpdater.onConfigChange, maybeUpdater, ctx.subscriptions);
    vscode_1.workspace.onDidChangeTextDocument(maybeUpdater.onDidChangeTextDocument, maybeUpdater, ctx.subscriptions);
    maybeUpdater.onConfigChange().catch(console.error);
}
exports.activateInlayHints = activateInlayHints;
//# sourceMappingURL=extension.js.map