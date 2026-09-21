import React, { useState } from 'react';
import { Code, X, Copy, Check, Download, Folder, FileCode, Terminal } from 'lucide-react';
import { JAVA_PROJECT_FILES, JavaFileEntry } from '../data/javaProjectFiles';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface JavaSourceViewerModalProps {
  onClose: () => void;
}

export const JavaSourceViewerModal: React.FC<JavaSourceViewerModalProps> = ({ onClose }) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>('pom.xml');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const categories = [
    'ALL',
    'Configuration',
    'SQL & Resources',
    'Model / Entity',
    'Repository',
    'Service',
    'Controller',
    'Security & Exception',
    'Documentation',
  ];

  const filteredFiles = JAVA_PROJECT_FILES.filter(
    (f) => selectedCategory === 'ALL' || f.category === selectedCategory
  );

  const currentFile: JavaFileEntry =
    JAVA_PROJECT_FILES.find((f) => f.path === selectedFilePath) || JAVA_PROJECT_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Add each file into its exact folder hierarchy
      JAVA_PROJECT_FILES.forEach((file) => {
        zip.file(file.path, file.code);
      });

      // Add a root README.md
      zip.file(
        'README.md',
        `# AlumniConnect - Java Spring Boot Backend
Final Year B.Tech College Project

## Prerequisites
- Java 17 LTS (OpenJDK 17)
- Apache Maven 3.9+
- MySQL 8.0+

## Database Setup
1. Open MySQL Workbench or Terminal:
   \`mysql -u root -p\`
2. Execute the included \`src/main/resources/schema.sql\` script:
   \`SOURCE src/main/resources/schema.sql;\`

## Application Configuration
Verify \`src/main/resources/application.properties\` contains your MySQL credentials:
\`\`\`properties
spring.datasource.url=jdbc:mysql://localhost:3306/alumniconnect_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
\`\`\`

## Compile & Run
\`\`\`bash
mvn clean install
mvn spring-boot:run
\`\`\`

Server will start at \`http://localhost:8080\`
REST API Endpoints:
- Authentication: \`/api/auth/**\`
- Alumni Directory: \`/api/alumni/**\`
- Mentorship Program: \`/api/mentorship/**\`
- Events: \`/api/events/**\`
- Careers: \`/api/jobs/**\`
- Contributions: \`/api/contributions/**\`
`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'AlumniConnect-SpringBoot-Project.zip');
    } catch (err) {
      console.error('Error generating zip:', err);
      alert('Failed to generate ZIP file.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-6xl h-[92vh] shadow-2xl border border-slate-800 flex flex-col overflow-hidden text-slate-200 animate-in fade-in zoom-in-95">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Spring Boot 3.2 Java Backend Source</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Maven + JPA + Hibernate + MySQL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Production-grade OOP architecture: Controller ➔ Service ➔ Repository ➔ Entity
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>{isZipping ? 'Packaging ZIP...' : 'Download Project (.ZIP)'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="px-6 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center space-x-1.5 overflow-x-auto scrollbar-none text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Workspace: Left file list, Right editor */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Explorer */}
          <div className="w-72 sm:w-80 border-r border-slate-800 bg-slate-950/40 overflow-y-auto divide-y divide-slate-800/60">
            <div className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <Folder className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              Source Explorer ({filteredFiles.length} files)
            </div>

            {filteredFiles.map((file) => {
              const fileName = file.path.split('/').pop() || file.path;
              const isSelected = selectedFilePath === file.path;

              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFilePath(file.path)}
                  className={`w-full p-3 text-left transition-colors cursor-pointer flex items-center space-x-2.5 ${
                    isSelected
                      ? 'bg-amber-500/10 text-amber-300 font-bold border-r-2 border-amber-400'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs truncate font-mono">{fileName}</div>
                    <div className="text-[10px] text-slate-500 truncate">{file.category}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
            {/* File Path & Copy Toolbar */}
            <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span className="truncate">{currentFile.path}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center space-x-1.5 cursor-pointer border border-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy File'}</span>
                </button>
              </div>
            </div>

            {/* Code Output */}
            <div className="flex-1 p-5 overflow-auto font-mono text-xs text-slate-300 bg-slate-950/90 leading-relaxed selection:bg-amber-500/30">
              <pre className="whitespace-pre">
                <code>{currentFile.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
