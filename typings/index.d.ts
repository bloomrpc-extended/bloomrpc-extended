// declaration.d.ts
declare module '*.scss';
declare module '*.css';
declare module '*.json';
declare module '*.png';
declare module '*.jpg';
declare module '*.svg';

// Compile-time constants defined in electron.vite.config.ts
declare const PRODUCT_NAME: string;
declare const COPYRIGHT: string;
declare const HOMEPAGE: string;
declare const DESCRIPTION: string;
declare const LICENSE: string;
declare const BUG_REPORT_URL: string;
declare const VERSION: string;

/// <reference types="vite/client" />
