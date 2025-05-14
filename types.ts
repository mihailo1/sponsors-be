export interface StringItem {
  id: string;
  value: string;
}

export interface ServerStats {
  uptime: number;
  stringsCount: number;
  uniqueStringsCount: number;
  averageStringLength: number;
  memoryUsage: number;
  systemMemoryInfo: Deno.SystemMemoryInfo;
  strings: StringItem[];
}

export interface WordCloudData {
  text: string;
  size: number;
}
