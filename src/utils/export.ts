import type { Document, Block } from '../types';

const blockToMarkdown = (block: Block, indent: number = 0): string => {
  const prefix = '  '.repeat(indent);

  switch (block.type) {
    case 'heading1':
      return `${prefix}# ${block.content}\n\n`;
    case 'heading2':
      return `${prefix}## ${block.content}\n\n`;
    case 'heading3':
      return `${prefix}### ${block.content}\n\n`;
    case 'paragraph':
      return `${prefix}${block.content}\n\n`;
    case 'bulletList':
      let md = `${prefix}- ${block.content}\n`;
      if (block.children) {
        block.children.forEach(child => {
          md += blockToMarkdown(child, indent + 1);
        });
      }
      return md + '\n';
    case 'numberedList':
      return `${prefix}1. ${block.content}\n\n`;
    case 'quote':
      return `${prefix}> ${block.content}\n\n`;
    case 'code':
      return `\`\`\`\n${block.content}\n\`\`\`\n\n`;
    case 'todo':
      return `${prefix}- [${block.checked ? 'x' : ' '}] ${block.content}\n\n`;
    case 'table':
      if (block.rows && block.rows.length > 0) {
        const header = block.rows[0];
        let table = `| ${header.join(' | ')} |\n`;
        table += `| ${header.map(() => '---').join(' | ')} |\n`;
        block.rows.slice(1).forEach(row => {
          table += `| ${row.join(' | ')} |\n`;
        });
        return table + '\n';
      }
      return '';
    case 'image':
      return `![图片](${block.content})\n\n`;
    default:
      return `${prefix}${block.content}\n\n`;
  }
};

export const exportToMarkdown = (document: Document): string => {
  let md = `# ${document.title}\n\n`;
  document.content.forEach(block => {
    md += blockToMarkdown(block);
  });
  return md;
};

const blockToHtml = (block: Block): string => {
  switch (block.type) {
    case 'heading1':
      return `<h1>${block.content}</h1>`;
    case 'heading2':
      return `<h2>${block.content}</h2>`;
    case 'heading3':
      return `<h3>${block.content}</h3>`;
    case 'paragraph':
      return `<p>${block.content}</p>`;
    case 'bulletList':
      return `<ul><li>${block.content}</li></ul>`;
    case 'numberedList':
      return `<ol><li>${block.content}</li></ol>`;
    case 'quote':
      return `<blockquote>${block.content}</blockquote>`;
    case 'code':
      return `<pre><code>${block.content}</code></pre>`;
    case 'todo':
      return `<div style="display:flex;align-items:center;gap:8px;"><input type="checkbox" ${block.checked ? 'checked' : ''} disabled> <span>${block.content}</span></div>`;
    case 'table':
      if (block.rows && block.rows.length > 0) {
        let html = '<table style="border-collapse:collapse;width:100%;margin:16px 0;">';
        block.rows.forEach((row, rowIndex) => {
          html += '<tr>';
          row.forEach(cell => {
            if (rowIndex === 0) {
              html += `<th style="border:1px solid #ddd;padding:8px 12px;text-align:left;background:#f8fafc;">${cell}</th>`;
            } else {
              html += `<td style="border:1px solid #ddd;padding:8px 12px;text-align:left;">${cell}</td>`;
            }
          });
          html += '</tr>';
        });
        html += '</table>';
        return html;
      }
      return '';
    case 'image':
      return `<img src="${block.content}" alt="图片" style="max-width:100%;border-radius:8px;margin:10px 0;">`;
    default:
      return `<p>${block.content}</p>`;
  }
};

const documentToHtml = (document: Document): string => {
  let html = `<h1 style="color:#1E3A5F;border-bottom:2px solid #FF6B35;padding-bottom:10px;">${document.title}</h1>`;
  document.content.forEach(block => {
    html += blockToHtml(block);
  });
  return html;
};

export const downloadFile = (content: string | Blob, filename: string, type: string): void => {
  let blob: Blob;
  if (typeof content === 'string') {
    blob = new Blob([content], { type });
  } else {
    blob = content;
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToMarkdownFile = (document: Document): void => {
  const md = exportToMarkdown(document);
  downloadFile(md, `${document.title}.md`, 'text/markdown');
};

export const exportToPdf = (document: Document): void => {
  const htmlContent = `
    <!DOCTYPE html>
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <title>${document.title}</title>
      <style>
        body {
          font-family: 'Microsoft YaHei', 'Inter', sans-serif;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.8;
          color: #333;
        }
        h1 {
          color: #1E3A5F;
          border-bottom: 2px solid #FF6B35;
          padding-bottom: 10px;
          font-size: 28px;
        }
        h2 {
          color: #1E3A5F;
          margin-top: 30px;
          font-size: 22px;
        }
        h3 {
          color: #333;
          margin-top: 20px;
          font-size: 18px;
        }
        p {
          margin: 12px 0;
        }
        code {
          background: #f4f4f4;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'JetBrains Mono', 'Consolas', monospace;
          font-size: 14px;
          color: #E74C3C;
        }
        pre {
          background: #1E3A5F;
          color: #fff;
          padding: 15px;
          border-radius: 8px;
          overflow-x: auto;
        }
        pre code {
          background: transparent;
          color: #fff;
        }
        blockquote {
          border-left: 4px solid #FF6B35;
          padding-left: 15px;
          color: #666;
          margin: 20px 0;
          font-style: italic;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px 12px;
          text-align: left;
        }
        th {
          background: #F8FAFC;
          font-weight: 600;
        }
        img {
          max-width: 100%;
          border-radius: 8px;
          margin: 10px 0;
        }
        ul, ol {
          padding-left: 24px;
          margin: 12px 0;
        }
        li {
          margin: 6px 0;
        }
        @media print {
          body {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      ${documentToHtml(document)}
    </body>
    </html>
  `;

  const printWin = window.open('', '_blank');
  if (printWin) {
    printWin.document.write(htmlContent);
    printWin.document.close();
    printWin.onload = () => {
      setTimeout(() => {
        printWin.print();
      }, 500);
    };
  }
};

export const exportToWord = (document: Document): void => {
  const htmlContent = `
    <!DOCTYPE html>
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <title>${document.title}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        body {
          font-family: 'Microsoft YaHei', 'SimSun', sans-serif;
          line-height: 1.8;
          color: #333;
          font-size: 12pt;
        }
        h1 {
          color: #1E3A5F;
          border-bottom: 2px solid #FF6B35;
          padding-bottom: 10px;
          font-size: 22pt;
          font-weight: bold;
          margin-bottom: 20px;
        }
        h2 {
          color: #1E3A5F;
          margin-top: 24px;
          font-size: 16pt;
          font-weight: bold;
        }
        h3 {
          color: #333;
          margin-top: 18px;
          font-size: 14pt;
          font-weight: bold;
        }
        p {
          margin: 10px 0;
          text-align: justify;
        }
        code {
          background: #f4f4f4;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Consolas', monospace;
          color: #E74C3C;
        }
        pre {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 4px;
          border: 1px solid #ddd;
          font-family: 'Consolas', monospace;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        blockquote {
          border-left: 4px solid #FF6B35;
          padding-left: 15px;
          color: #666;
          margin: 20px 0;
          font-style: italic;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px 12px;
          text-align: left;
        }
        th {
          background: #F8FAFC;
          font-weight: bold;
        }
        img {
          max-width: 100%;
          height: auto;
          margin: 10px 0;
        }
        ul, ol {
          padding-left: 24px;
          margin: 12px 0;
        }
        li {
          margin: 6px 0;
        }
      </style>
    </head>
    <body>
      ${documentToHtml(document)}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
  downloadFile(blob, `${document.title}.doc`, 'application/msword');
};

export const exportDocument = (document: Document, format: 'md' | 'pdf' | 'docx'): void => {
  switch (format) {
    case 'md':
      exportToMarkdownFile(document);
      break;
    case 'pdf':
      exportToPdf(document);
      break;
    case 'docx':
      exportToWord(document);
      break;
  }
};
