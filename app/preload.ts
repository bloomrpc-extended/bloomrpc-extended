/**
 * Preload script - runs in renderer before page content.
 *
 * Patches Node's module resolver so that require('grpc') returns the same
 * module instance as require('@grpc/grpc-js'). Without this, the 'grpc'
 * npm override creates a separate copy in node_modules/grpc, and
 * bloomrpc-mock's require('grpc').loadPackageDefinition creates service
 * constructors that expect a different ChannelCredentials class than
 * the one from require('@grpc/grpc-js').credentials.createInsecure().
 *
 * Instead of resolving to a fixed path (which depends on the preload's
 * location and may differ between dev and packaged builds), we resolve
 * '@grpc/grpc-js' from the *caller's* context so both sides always get
 * the same module instance.
 */
import Module from 'module';

const origResolveFilename = (Module as any)._resolveFilename;
(Module as any)._resolveFilename = function (
  request: string,
  parent: any,
  isMain: boolean,
  options: any,
) {
  if (request === 'grpc') {
    return origResolveFilename.call(this, '@grpc/grpc-js', parent, isMain, options);
  }
  return origResolveFilename.call(this, request, parent, isMain, options);
};
