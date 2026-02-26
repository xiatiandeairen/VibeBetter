import * as vscode from 'vscode';

let sessionStart: Date | null = null;

export function activate(context: vscode.ExtensionContext) {
  console.log('VibeBetter extension activated');
  
  sessionStart = new Date();

  const saveDisposable = vscode.workspace.onDidSaveTextDocument((doc) => {
    trackEvent('file_save', { filePath: vscode.workspace.asRelativePath(doc.uri) });
  });

  const editorDisposable = vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor) {
      trackEvent('file_open', { filePath: vscode.workspace.asRelativePath(editor.document.uri) });
    }
  });

  context.subscriptions.push(saveDisposable, editorDisposable);
}

export function deactivate() {
  if (sessionStart) {
    const duration = Math.round((Date.now() - sessionStart.getTime()) / 1000);
    trackEvent('session_end', { duration });
  }
}

async function trackEvent(eventType: string, metadata: Record<string, unknown>) {
  const config = vscode.workspace.getConfiguration('vibebetter');
  const apiUrl = config.get<string>('apiUrl', 'http://localhost:3001');
  const apiKey = config.get<string>('apiKey', '');
  const projectId = config.get<string>('projectId', '');
  
  if (!apiKey || !projectId) return;
  
  try {
    await fetch(`${apiUrl}/api/v1/behaviors/projects/${projectId}/user-behaviors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
      body: JSON.stringify({ eventType, metadata }),
    });
  } catch {
    // Silently fail - don't disrupt developer workflow
  }
}
