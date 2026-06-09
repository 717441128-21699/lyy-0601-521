import type { Document, Block } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const getTableRows = (block: Block): string[][] => {
  if (block.rows && block.rows.length > 0) {
    return block.rows;
  }
  if (block.content && block.content.includes('|')) {
    return block.content
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.split('|').map(cell => cell.trim()).filter(cell => cell !== ''));
  }
  return [];
};

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
    case 'table': {
      const rows = getTableRows(block);
      if (rows.length > 0) {
        const header = rows[0];
        let table = `| ${header.join(' | ')} |\n`;
        table += `| ${header.map(() => '---').join(' | ')} |\n`;
        rows.slice(1).forEach(row => {
          table += `| ${row.join(' | ')} |\n`;
        });
        return table + '\n';
      }
      return '';
    }
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
      return `<h1 style="color:#1E3A5F;font-size:28px;font-weight:bold;margin:24px 0 16px 0;padding-bottom:8px;border-bottom:2px solid #FF6B35;">${block.content}</h1>`;
    case 'heading2':
      return `<h2 style="color:#1E3A5F;font-size:22px;font-weight:bold;margin:20px 0 12px 0;">${block.content}</h2>`;
    case 'heading3':
      return `<h3 style="color:#333;font-size:18px;font-weight:bold;margin:16px 0 8px 0;">${block.content}</h3>`;
    case 'paragraph':
      return `<p style="margin:12px 0;line-height:1.8;color:#333;">${block.content}</p>`;
    case 'bulletList':
      return `<ul style="padding-left:24px;margin:12px 0;"><li style="margin:6px 0;line-height:1.8;">${block.content}</li></ul>`;
    case 'numberedList':
      return `<ol style="padding-left:24px;margin:12px 0;"><li style="margin:6px 0;line-height:1.8;">${block.content}</li></ol>`;
    case 'quote':
      return `<blockquote style="border-left:4px solid #FF6B35;padding-left:15px;color:#666;margin:20px 0;font-style:italic;line-height:1.8;">${block.content}</blockquote>`;
    case 'code':
      return `<pre style="background:#1E3A5F;color:#fff;padding:15px;border-radius:8px;overflow-x:auto;margin:16px 0;"><code style="font-family:'Consolas','Monaco',monospace;font-size:14px;">${block.content}</code></pre>`;
    case 'todo':
      return `<div style="display:flex;align-items:center;gap:10px;margin:10px 0;padding:8px 12px;background:#f8fafc;border-radius:8px;"><input type="checkbox" ${block.checked ? 'checked' : ''} disabled style="width:18px;height:18px;accent-color:#FF6B35;"> <span style="color:#333;${block.checked ? 'text-decoration:line-through;color:#999;' : ''}">${block.content}</span></div>`;
    case 'table': {
      const rows = getTableRows(block);
      if (rows.length > 0) {
        let html = '<table style="border-collapse:collapse;width:100%;margin:20px 0;font-size:14px;">';
        rows.forEach((row, rowIndex) => {
          html += '<tr>';
          row.forEach(cell => {
            if (rowIndex === 0) {
              html += `<th style="border:1px solid #e2e8f0;padding:10px 14px;text-align:left;background:#f1f5f9;font-weight:600;color:#1E3A5F;">${cell}</th>`;
            } else {
              html += `<td style="border:1px solid #e2e8f0;padding:10px 14px;text-align:left;color:#333;">${cell}</td>`;
            }
          });
          html += '</tr>';
        });
        html += '</table>';
        return html;
      }
      return '';
    }
    case 'image':
      return `<img src="${block.content}" alt="图片" style="max-width:100%;height:auto;border-radius:8px;margin:16px 0;box-shadow:0 2px 8px rgba(0,0,0,0.1);">`;
    default:
      return `<p style="margin:12px 0;line-height:1.8;color:#333;">${block.content}</p>`;
  }
};

const documentToHtml = (document: Document): string => {
  let html = `<h1 style="color:#1E3A5F;font-size:32px;font-weight:bold;margin:0 0 24px 0;padding-bottom:16px;border-bottom:3px solid #FF6B35;">${document.title}</h1>`;
  document.content.forEach(block => {
    html += blockToHtml(block);
  });
  return html;
};

const generateDocumentHtml = (document: Document): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${document.title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Microsoft YaHei', 'Inter', 'PingFang SC', sans-serif;
          padding: 60px;
          max-width: 900px;
          margin: 0 auto;
          background: #fff;
          line-height: 1.8;
          color: #333;
        }
      </style>
    </head>
    <body>
      ${documentToHtml(document)}
    </body>
    </html>
  `;
};

export const downloadFile = (content: string | Blob, filename: string, type: string): void => {
  let blob: Blob;
  if (typeof content === 'string') {
    blob = new Blob([content], { type });
  } else {
    blob = content;
  }
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = filename;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToMarkdownFile = (document: Document): void => {
  const md = exportToMarkdown(document);
  downloadFile(md, `${document.title}.md`, 'text/markdown');
};

export const exportToPdf = async (doc: Document): Promise<void> => {
  const htmlContent = generateDocumentHtml(doc);
  
  const container = window.document.createElement('div');
  container.innerHTML = htmlContent;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '900px';
  container.style.background = '#fff';
  window.document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - 20);

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20);
    }

    pdf.save(`${doc.title}.pdf`);
  } catch (error) {
    console.error('PDF export failed:', error);
    alert('PDF 导出失败，请重试');
  } finally {
    window.document.body.removeChild(container);
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
          padding: 20px;
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
        .todo-item {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 10px 0;
          padding: 8px 12px;
          background: #f8fafc;
          border-radius: 8px;
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

export const exportDocument = async (document: Document, format: 'md' | 'pdf' | 'docx'): Promise<void> => {
  switch (format) {
    case 'md':
      exportToMarkdownFile(document);
      break;
    case 'pdf':
      await exportToPdf(document);
      break;
    case 'docx':
      exportToWord(document);
      break;
  }
};
