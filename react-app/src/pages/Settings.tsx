import React, { useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import { uploadFile } from "../queries";
import useToast from "../utils/toast";
import { ServerStats, StringItem, WordCloudData } from "../../../types";
import * as d3 from "d3";
import cloud from "d3-cloud";

function Settings() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [strings, setStrings] = useState<StringItem[]>([]);
  const toast = useToast();
  const wordCloudRef = useRef<HTMLDivElement>(null);
  console.log(window.location.host.replace('3000', '8000'));

  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.host.replace('3000', '8000')}/ws`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received WebSocket message:", data);
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

  useEffect(() => {
    const interval = setInterval(() => {
      const wordCloudData: WordCloudData[] = strings.map((str) => ({
        text: str.value,
        size: 10 + Math.random() * 90,
      }));

      const containerWidth = wordCloudRef.current?.offsetWidth || 800;
      const layout = cloud()
        .size([containerWidth, 400])
        .words(wordCloudData)
        .padding(5)
        .rotate(() => (Math.random() > 0.5 ? 90 : 0))
        .font("Impact")
        .fontSize((d) => d.size || 10) // Ensure size is always a number
        .on("end", draw);

      layout.start();

      function draw(words: any) {
        console.log("Drawing word cloud with words:", words);
        d3.select("#word-cloud").selectAll("*").remove();

        const svg = d3.select("#word-cloud")
          .append("svg")
          .attr("width", layout.size()[0])
          .attr("height", layout.size()[1])
          .append("g")
          .attr(
            "transform",
            "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 +
              ")",
          );

        const color = d3.scaleOrdinal(d3.schemePastel1);

        const text = svg.selectAll("text")
          .data(words)
          .enter()
          .append("text")
          .style("font-size", (d: any) => d.size + "px")
          .style("font-family", "Impact")
          .style("fill", (d: any, i: any) => color(i.toString()))
          .attr("text-anchor", "middle")
          .attr(
            "transform",
            (d: any) => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")",
          )
          .style("opacity", 0)
          .text((d: any) => d.text);

        text.transition()
          .duration(750)
          .attr(
            "transform",
            (d: any) => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")",
          )
          .style("opacity", 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [strings]);

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
          .then((data) => {
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
      {stats && (
        <div className="mt-4 text-gray-800 dark:text-dark-text">
          <p>Server Uptime: {stats.uptime} seconds</p>
          <p>Number of Strings: {stats.stringsCount}</p>
          <p>Memory Usage: {stats.memoryUsage} MB</p>
          <p>RAM Usage: {stats.systemMemoryInfo.total} KB ({((stats.systemMemoryInfo.total / 1024 / 1024)).toFixed(2)} MB, {((stats.systemMemoryInfo.total / 1024 / 1024 / 1024)).toFixed(2)} GB)</p>
          <p>RAM Available: {stats.systemMemoryInfo.available} KB ({((stats.systemMemoryInfo.available / 1024 / 1024)).toFixed(2)} MB, {((stats.systemMemoryInfo.available / 1024 / 1024 / 1024)).toFixed(2)} GB)</p>
          <p>RAM: {((stats.systemMemoryInfo.total - stats.systemMemoryInfo.available) / stats.systemMemoryInfo.total * 100).toFixed(2)}%</p>
        </div>
      )}
      <div id="word-cloud" ref={wordCloudRef} className="mt-8"></div>
    </div>
  );
}

export default Settings;
