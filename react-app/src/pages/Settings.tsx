import React, { useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import { uploadFile } from "../queries";
import useToast from "../utils/toast";
import { ServerStats, StringItem, WordCloudData } from "../types";
import cloud from "d3-cloud";
import {
  drawWordCloud,
  drawRamGauge,
  drawMemoryBar,
  drawUptime,
  animateStringsStats,
} from "../api/utils/d3Visualizations";

function Settings() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [strings, setStrings] = useState<StringItem[]>([]);
  const toast = useToast();
  const wordCloudRef = useRef<HTMLDivElement>(null);
  const ramGaugeRef = useRef<HTMLDivElement>(null);
  const memoryBarRef = useRef<HTMLDivElement>(null);
  const uptimeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use ws:// for localhost (dev), wss:// for production
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const wsProtocol = isLocalhost ? "ws" : "wss";
    const wsPort = window.location.port === "3000" ? "8000" : window.location.port;
    const wsUrl = `${wsProtocol}://${window.location.hostname}:${wsPort}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStats(data);
      setStrings(data.strings);
    };
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    return () => {
      ws.close();
    };
  }, []);

  // Helper: check if any value in systemMemoryInfo is 0
  const hasZeroSystemMemory = (info: any) => {
    if (!info) return true;
    return Object.values(info).some((v) => v === 0);
  };

  // Merge all D3 visualizations into one useEffect
  useEffect(() => {
    if (!stats) return;
    // Word cloud
    drawWordCloud(strings.map((str) => ({ text: str.value, size: 10 + Math.random() * 90 })), wordCloudRef.current);
    // Strings stats
    animateStringsStats(stats);
    // Memory and uptime (if systemMemoryInfo is valid)
    if (!hasZeroSystemMemory(stats.systemMemoryInfo)) {
      drawRamGauge(stats, ramGaugeRef.current);
      drawMemoryBar(stats, memoryBarRef.current);
      drawUptime(stats, uptimeRef.current);
    }
  }, [stats, strings]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = () => {
        uploadFile(reader.result)
          .then(() => {
            toast.success("File uploaded successfully!");
            setFile(null);
          })
          .catch((error) => {
            toast.error("Error uploading file!");
            console.error("Error uploading file:", error);
          })
          .finally(() => {
            setLoading(false);
          });
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="geologica-regular">
      <h2 className="text-3xl font-semibold text-gray-800 dark:text-dark-text">
        Settings
      </h2>
      <div className="mt-4 flex flex-col gap-2">
        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="text-gray-800 dark:text-dark-text"
        />
        <Button
          onClick={handleUpload}
          disabled={loading}
          className="relative flex items-center justify-center"
        >
          {loading
            ? (
              <svg
                className="animate-spin h-5 w-5 mr-3 text-white absolute left-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                >
                </circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                >
                </path>
              </svg>
            )
            : null}
          Replace list
        </Button>
      </div>
      {/* Fancy D3 Strings Stats */}
      {stats && (
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex flex-row gap-8 items-end">
            <div className="flex flex-col items-center max-w-[140px]">
              <span className="text-lg font-medium">Strings Count</span>
              <span id="stringsCount" className="text-3xl font-bold text-blue-600">0</span>
            </div>
            <div className="flex flex-col items-center max-w-[140px]">
              <span className="text-lg font-medium">Avg. String Length</span>
              <span id="averageLength" className="text-3xl font-bold text-green-600">0</span>
            </div>
          </div>
        </div>
      )}
      {/* Hide memory if any systemMemoryInfo value is 0 */}
      {stats && !hasZeroSystemMemory(stats.systemMemoryInfo) && (
        <div className="mt-8 flex md:flex-row md:justify-center md:items-stretch gap-8 text-gray-800 dark:text-dark-text flex-row gap-1">
          <div ref={uptimeRef} className="flex flex-col items-center justify-center min-w-[220px]" />
          <div ref={memoryBarRef} className="flex flex-col items-center justify-center min-w-[240px]" />
          <div ref={ramGaugeRef} className="flex flex-col items-center justify-center min-w-[260px]" />
        </div>
      )}
      <div id="word-cloud" ref={wordCloudRef} className="mt-8"></div>
    </div>
  );
}

export default Settings;
