import * as remote from '@electron/remote';
import {fromFileName, mockRequestMethods, Proto, walkServices} from 'bloomrpc-mock';
import * as path from 'path';
import {ProtoFile, ProtoService} from './protobuf';
import {Service} from 'protobufjs';
import * as protobuf from 'protobufjs';
import {Client} from 'grpc-reflection-js';
import {credentials, loadPackageDefinition} from '@grpc/grpc-js';
import {fromJSON} from '@grpc/proto-loader';
import isURL from 'validator/lib/isURL';

const commonProtosPath = [
  process.env.NODE_ENV === 'development'
    ? path.join(process.cwd(), 'static')
    : path.join(process.resourcesPath!, 'static'),
];

function loadObjectFromRoot(root: protobuf.Root) {
  const pd = fromJSON(root.toJSON(), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  return loadPackageDefinition(pd);
}

export type OnProtoUpload = (protoFiles: ProtoFile[], err?: Error) => void

/**
 * Upload protofiles
 * @param onProtoUploaded
 * @param importPaths
 */
export async function importProtos(onProtoUploaded: OnProtoUpload, importPaths?: string[]) {
  const openDialogResult = await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Protos', extensions: ['proto'] },
    ]
  });

  const filePaths = openDialogResult.filePaths;

  if (!filePaths) {
    return;
  }
  await loadProtosFromFile(filePaths, importPaths, onProtoUploaded);
}

/**
 * Upload protofiles from gRPC server reflection
 * @param onProtoUploaded
 * @param host
 */
export async function importProtosFromServerReflection(onProtoUploaded: OnProtoUpload, host: string) {
  await loadProtoFromReflection(host, onProtoUploaded);
}

/**
 * Load protocol buffer files
 * @param filePaths
 * @param importPaths
 * @param onProtoUploaded
 */
export async function loadProtos(protoPaths: string[], importPaths?: string[], onProtoUploaded?: OnProtoUpload): Promise<ProtoFile[]> {
  function isReflectionUrl(protoPath: string): boolean {
    // File paths: absolute paths or paths ending in .proto are never reflection URLs
    if (protoPath.startsWith('/') || protoPath.startsWith('\\') || /^[A-Za-z]:/.test(protoPath) || protoPath.endsWith('.proto')) {
      return false;
    }
    return isURL(protoPath, {
      require_tld: false,
      require_protocol: false,
      require_host: false,
      require_valid_protocol: false,
    });
  }

  const protoUrls = protoPaths.filter((protoPath) => {
    return isReflectionUrl(protoPath);
  })

  const protoFiles = protoPaths.filter((protoPath) => {
    return !isReflectionUrl(protoPath);
  })

  const protoFileFromFiles = await loadProtosFromFile(protoFiles, importPaths, onProtoUploaded);

  let protoFileFromReflection: ProtoFile[] = [];
  for (const protoUrl of protoUrls) {
    protoFileFromReflection = protoFileFromReflection.concat(await loadProtoFromReflection(protoUrl, onProtoUploaded));
  }

  return protoFileFromFiles.concat(protoFileFromReflection);
}

/**
 * Load protocol buffer files from gRPC server reflection
 * @param host
 * @param onProtoUploaded
 */
export async function loadProtoFromReflection(host: string, onProtoUploaded?: OnProtoUpload): Promise<ProtoFile[]> {
  try {
    const reflectionClient = new Client(host, credentials.createInsecure());
    const services = (await reflectionClient.listServices()) as string[];
    const serviceRoots = await Promise.all(
        services
            .filter(s => s && s !== 'grpc.reflection.v1alpha.ServerReflection')
            .map((service: string) => reflectionClient.fileContainingSymbol(service))
    );

    const protos = serviceRoots.map((root) => {
      return {
        fileName: root.files[root.files.length - 1],
        filePath: host,
        protoText: "proto text not supported in gRPC reflection",
        ast: loadObjectFromRoot(root),
        root: root
      }
    });

    const protoList = protos.reduce((list: ProtoFile[], proto: Proto) => {
      // Services with methods
      const services = parseServices(proto);

      // Proto file
      list.push({
        proto,
        fileName: proto.fileName,
        services
      });

      return list;
    }, []);

    onProtoUploaded && onProtoUploaded(protoList, undefined);
    return protoList;

  } catch (e) {
    console.error(e);
    onProtoUploaded && onProtoUploaded([], e);

    if (!onProtoUploaded) {
      throw e;
    }

    return []
  }
}

/**
 * Load protocol buffer files from proto files
 * @param filePaths
 * @param importPaths
 * @param onProtoUploaded
 */
export async function loadProtosFromFile(filePaths: string[], importPaths?: string[], onProtoUploaded?: OnProtoUpload): Promise<ProtoFile[]> {
  try {
    const protos = await Promise.all(filePaths.map((fileName) =>
      fromFileName(fileName, [
        ...(importPaths ? importPaths : []),
        ...commonProtosPath,
      ])
    ));

    const protoList = protos.reduce((list: ProtoFile[], proto: Proto) => {

      // Services with methods
      const services = parseServices(proto);

      // Proto file
      list.push({
        proto,
        fileName: proto.fileName.split(path.sep).pop() || "",
        services,
      });

      return list;
    }, []);
    onProtoUploaded && onProtoUploaded(protoList, undefined);
    return protoList;

  } catch (e) {
    console.error(e);
    onProtoUploaded && onProtoUploaded([], e);

    if (!onProtoUploaded) {
      throw e;
    }

    return [];
  }
}

/**
 * Parse Grpc services from root
 * @param proto
 */
function parseServices(proto: Proto) {

  const services: {[key: string]: ProtoService} = {};

  walkServices(proto, (service: Service, _: any, serviceName: string) => {
    const mocks = mockRequestMethods(service);
    services[serviceName] = {
      serviceName: serviceName,
      proto,
      methodsMocks: mocks,
      methodsName: Object.keys(mocks),
    };
  });

  return services;
}

export function importResolvePath(): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const openDialogResult = await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
      properties: ['openDirectory'],
      filters: []
    });

    const filePaths = openDialogResult.filePaths;

    if (!filePaths) {
      return reject("No folder selected");
    }
    resolve(filePaths[0]);
  });
}
