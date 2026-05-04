declare module 'lucide-react';
declare module 'framer-motion';
declare module 'jspdf';
declare module 'html2canvas';
declare module 'pdfjs-dist';
declare module 'path';
declare module 'url';
declare module '*.css';

declare interface ProcessEnv {
  [key: string]: string | undefined;
}

declare var process: {
  env: ProcessEnv;
  cwd(): string;
};
