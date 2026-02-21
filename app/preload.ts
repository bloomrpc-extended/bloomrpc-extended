/**
 * Preload script - runs in renderer before page content.
 *
 * Patches Node's module resolver so that require('grpc') returns the same
 * module instance as require('@grpc/grpc-js'). Without this, the 'grpc'
 * npm override creates a separate copy in node_modules/grpc, and
 * bloomrpc-mock's require('grpc').loadPackageDefinition creates service
 * constructors that expect a different ChannelCredentials class than
 * the one from require('@grpc/grpc-js').credentials.createInsecure().
 */
import Module from 'module';

const grpcJsPath = require.resolve('@grpc/grpc-js');
const origResolveFilename = (Module as any)._resolveFilename;
(Module as any)._resolveFilename = function (
  request: string,
  parent: any,
  isMain: boolean,
  options: any,
) {
  if (request === 'grpc') {
    return grpcJsPath;
  }
  return origResolveFilename.call(this, request, parent, isMain, options);
};
