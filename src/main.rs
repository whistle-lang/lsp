use tower_lsp::jsonrpc::Result;
use tower_lsp::lsp_types::*;
use tower_lsp::{Client, LanguageServer, LspService, Server};

#[derive(Debug)]
struct Backend {
    client: Client,
}

#[tower_lsp::async_trait]
impl LanguageServer for Backend {
    async fn initialize(&self, _: InitializeParams) -> Result<InitializeResult> {
        Ok(InitializeResult {
            capabilities: ServerCapabilities {
                hover_provider: Some(HoverProviderCapability::Simple(true)),
                completion_provider: Some(CompletionOptions::default()),
                ..Default::default()
            },
            ..Default::default()
        })
    }

    async fn initialized(&self, _: InitializedParams) {
        self.client
            .log_message(MessageType::INFO, "server initialized!")
            .await;
    }

    async fn shutdown(&self) -> Result<()> {
        Ok(())
    }

    async fn completion(&self, _: CompletionParams) -> Result<Option<CompletionResponse>> {
        Ok(Some(CompletionResponse::Array(vec![
            CompletionItem::new_simple("i32".to_string(), "32-bit signed integer type.".to_string()),
            CompletionItem::new_simple("i64".to_string(), "64-bit signed integer type.".to_string()),
            CompletionItem::new_simple("u32".to_string(), "32-bit unsigned integer type.".to_string()),
            CompletionItem::new_simple("u64".to_string(), "64-bit unsigned integer type.".to_string()),
            CompletionItem::new_simple("f32".to_string(), "32-bit floating point type.".to_string()),
            CompletionItem::new_simple("f64".to_string(), "64-bit floating point type.".to_string()),
            CompletionItem::new_simple("str".to_string(), "String.".to_string()),
            CompletionItem::new_simple("char".to_string(), "Single character.".to_string()),
            CompletionItem::new_simple("bool".to_string(), "Boolean.".to_string()),
            CompletionItem::new_simple("none".to_string(), "No value.".to_string()),
        ])))
    }

    async fn hover(&self, _: HoverParams) -> Result<Option<Hover>> {
        Ok(Some(Hover {
            contents: HoverContents::Scalar(
                MarkedString::String("Hover Test!".to_string())
            ),
            range: None
        }))
    }
}

#[tokio::main]
async fn main() {
    let stdin = tokio::io::stdin();
    let stdout = tokio::io::stdout();

    let (service, socket) = LspService::new(|client| Backend { client });
    Server::new(stdin, stdout, socket).serve(service).await;
}