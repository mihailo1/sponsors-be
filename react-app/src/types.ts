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
  systemMemoryInfo: any; // Use 'any' for now, or define the shape if needed
  strings: StringItem[];
}

export interface WordCloudData {
  text: string;
  size: number;
}
