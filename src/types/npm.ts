export interface NpmPackage {
  name: string;
  version: string;
  description?: string;
  keywords?: string[];
  license?: string;
  homepage?: string;
  repository?: {
    type: string;
    url: string;
  };
  bugs?: {
    url: string;
  };
  author?: {
    name: string;
    email?: string;
    url?: string;
  } | string;
  maintainers?: Array<{
    name: string;
    email?: string;
  }>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export interface NpmSearchResult {
  package: {
    name: string;
    scope: string;
    version: string;
    description?: string;
    keywords?: string[];
    date: string;
    links: {
      npm: string;
      homepage?: string;
      repository?: string;
      bugs?: string;
    };
    author?: {
      name: string;
      email?: string;
      url?: string;
    };
    publisher: {
      username: string;
      email: string;
    };
    maintainers: Array<{
      username: string;
      email: string;
    }>;
  };
  score: {
    final: number;
    detail: {
      quality: number;
      popularity: number;
      maintenance: number;
    };
  };
  searchScore: number;
}

export interface NpmSearchResponse {
  objects: NpmSearchResult[];
  total: number;
  time: string;
}

export interface NpmPackageDetails {
  _id: string;
  _rev: string;
  name: string;
  description?: string;
  'dist-tags': {
    latest: string;
    [key: string]: string;
  };
  versions: Record<string, NpmVersionInfo>;
  time: Record<string, string>;
  maintainers: Array<{
    name: string;
    email?: string;
  }>;
  author?: {
    name: string;
    email?: string;
    url?: string;
  };
  repository?: {
    type: string;
    url: string;
  };
  keywords?: string[];
  license?: string;
  homepage?: string;
  bugs?: {
    url: string;
  };
  readme?: string;
  readmeFilename?: string;
}

export interface NpmVersionInfo {
  name: string;
  version: string;
  description?: string;
  main?: string;
  module?: string;
  types?: string;
  typings?: string;
  type?: "module" | "commonjs" | string;
  exports?: unknown;
  sideEffects?: boolean | string[];
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  engines?: Record<string, string>;
  dist: {
    integrity: string;
    shasum: string;
    tarball: string;
    fileCount?: number;
    unpackedSize?: number;
    signatures?: Array<{
      keyid: string;
      sig: string;
    }>;
  };
}

export interface NpmDownloads {
  downloads: number;
  start: string;
  end: string;
  package: string;
}

export interface NpmDownloadsRange {
  downloads: Array<{
    downloads: number;
    day: string;
  }>;
  start: string;
  end: string;
  package: string;
}

export interface PackageCompareData {
  name: string;
  description?: string;
  version: string;
  weeklyDownloads: number;
  license?: string;
  dependencies: number;
  devDependencies: number;
  peerDependencies: number;
  maintainers: number;
  keywords: string[];
  lastPublish: string;
  repository?: string;
  unpackedSize?: number;
}
