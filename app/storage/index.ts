import {clearEditor} from './editor';
import {clearImportPaths} from './importPaths';
import {clearTLS} from './tls';
import {clearSettings} from './settings';


export * from './editor';
export * from './importPaths';
export * from './tls';
export * from './settings';


export function clearAll() {
  clearEditor();
  clearImportPaths();
  clearTLS();
  clearSettings();
}