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
      const rows = block.content.split('\n');
      if (rows.length < 2) return '';
      const header = rows[0].split('|');
      let table = `| ${header.join(' | ')} |\n`;
      table += `| ${header.map(() => '---').join(' | ')} |\n`;
      rows.slice(1).forEach(row => {
        const cells = row.split('|');
        table += `| ${cells.join(' | ')} |\n`;
      });
      return table + '\n';
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

export const downloadFile = (content: string, filename: string, type: string): void => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportDocument = (document: Document, format: 'md' | 'pdf' | 'docx'): void => {
  const md = exportToMarkdown(document);
  
  switch (format) {
    case 'md':
      downloadFile(md, `${document.title}.md`, 'text/markdown');
      break;
    case 'pdf':
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${document.title}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #1E3A5F; border-bottom: 2px solid #FF6B35; padding-bottom: 10px; }
            h2 { color: #1E3A5F; margin-top: 30px; }
            h3 { color: #333; margin-top: 20px; }
            code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; }
            pre { background: #1E3A5F; color: #fff; padding: 15px; border-radius: 8px; overflow-x: auto; }
            pre code { background: transparent; color: #fff; }
            blockquote { border-left: 4px solid #FF6B35; padding-left: 15px; color: #666; margin: 20px 0; }
            table { border-collapse: collapse; width: 100%; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
            th { background: #F8FAFC; }
            img { max-width: 100%; border-radius: 8px; margin: 10px 0; }
          </style>
        </head>
        <body>${mdToHtml(md)}</body>
        </html>
      `;
      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.write(printContent);
        printWin.document.close();
        printWin.onload = () => {
          printWin.print();
        };
      }
      break;
    case 'docx':
      downloadFile(md, `${document.title}.md`, 'text/markdown');
      alert('Word 导出功能需要后端支持，当前已导出 Markdown 格式，可使用在线工具转换。');
      break;
  }
};

const mdToHtml = (md: string): string => {
  return md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/`{3}([\s\S]*?)`{3}/gim, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/^- \[x\] (.*$)/gim, '<div><input type="checkbox" checked disabled> $1</div>')
    .replace(/^- \[ \] (.*$)/gim, '<div><input type="checkbox" disabled> $1</div>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/^1\. (.*$)/gim, '<li>$1</li>')
    .replace(/\|(.+)\|/gim, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      return `<tr>${cells.map(c => `<td>${c.trim()}</td>`).join('')}</tr>`;
    })
    .replace(/!\[([^\]]+)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1">')
    .replace(/\n\n/gim, '<br><br>');
};
