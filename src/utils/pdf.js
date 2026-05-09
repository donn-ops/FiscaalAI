import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export const exportToPDF = async (messages, userName = '') => {
  const html = `
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #2c3e50; }
        .header { background: #154273; color: white; padding: 20px; border-radius: 8px; margin-bottom: 24px; }
        .header h1 { margin: 0; font-size: 22px; }
        .header p { margin: 4px 0 0; font-size: 12px; opacity: 0.8; }
        .message { margin-bottom: 16px; }
        .user-msg { background: #EEF2F7; border-radius: 8px; padding: 12px 16px; }
        .ai-msg { background: white; border: 1px solid #dde3ed; border-left: 4px solid #154273; border-radius: 8px; padding: 12px 16px; }
        .label { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
        .user-label { color: #154273; }
        .ai-label { color: #154273; }
        .text { font-size: 13px; line-height: 1.6; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #dde3ed; font-size: 10px; color: #a0aec0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Taxly — Belastingadvies</h1>
        <p>${userName ? `Advies voor: ${userName}` : ''} | ${new Date().toLocaleDateString('nl-NL')}</p>
      </div>
      ${messages.map(m => `
        <div class="message">
          <div class="${m.role === 'user' ? 'user-msg' : 'ai-msg'}">
            <div class="label ${m.role === 'user' ? 'user-label' : 'ai-label'}">
              ${m.role === 'user' ? (userName || 'U') : 'Taxly'}
            </div>
            <div class="text">${m.content.replace(/\n/g, '<br>')}</div>
          </div>
        </div>
      `).join('')}
      <div class="footer">
        Dit advies is informatief van aard en geen vervanging voor een gecertificeerde belastingadviseur (RB/AA).
        Gegenereerd door Taxly op ${new Date().toLocaleString('nl-NL')}.
      </div>
    </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Taxly Advies Delen',
  });
};

export const shareAsText = async (messages, userName = '') => {
  const text = messages.map(m =>
    `${m.role === 'user' ? (userName || 'U') : 'Taxly'}:\n${m.content}`
  ).join('\n\n---\n\n');

  await Sharing.shareAsync(
    `data:text/plain;base64,${btoa(unescape(encodeURIComponent(text)))}`,
    { mimeType: 'text/plain', dialogTitle: 'Taxly Advies Delen' }
  );
};
