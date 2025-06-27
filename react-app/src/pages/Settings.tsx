import React, { useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import { uploadFile } from "../queries";
import useToast from "../utils/toast";
import { ServerStats, StringItem, WordCloudData } from "../types";
import * as d3 from "d3";
import cloud from "d3-cloud";

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

  // RAM Gauge (Donut)
  useEffect(() => {
    if (!stats || !ramGaugeRef.current) return;
    const used = stats.systemMemoryInfo.total - stats.systemMemoryInfo.available;
    const percent = used / stats.systemMemoryInfo.total;
    const width = 180, height = 180, thickness = 30; // Restore original size
    d3.select(ramGaugeRef.current).selectAll('*').remove();
    const svg = d3.select(ramGaugeRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width/2},${height/2})`);
    const arc = d3.arc()
      .innerRadius(width/2 - thickness)
      .outerRadius(width/2)
      .startAngle(0);
    svg.append('path')
      .datum({endAngle: 2 * Math.PI})
      .style('fill', '#e5e7eb')
      .attr('d', arc as any);
    svg.append('path')
      .datum({endAngle: 2 * Math.PI * percent})
      .style('fill', '#60a5fa')
      .attr('d', arc as any);
    // Center the percentage and label vertically
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -8)
      .attr('font-size', 28)
      .attr('fill', '#374151')
      .text(`${(percent*100).toFixed(1)}%`);
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 20)
      .attr('font-size', 14)
      .attr('fill', '#6b7280')
      .text('RAM Used');
  }, [stats]);

  // Memory Usage Bar
  useEffect(() => {
    if (!stats || !memoryBarRef.current) return;
    const used = stats.memoryUsage;
    const max = stats.systemMemoryInfo.total / 1024; // Convert KB to MB
    const width = 220, height = 64; // Increased height for a taller bar
    d3.select(memoryBarRef.current).selectAll('*').remove();
    const svg = d3.select(memoryBarRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    svg.append('text')
      .attr('x', width/2)
      .attr('y', 18)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13)
      .attr('fill', '#6b7280')
      .text('Memory Usage');
    svg.append('rect')
      .attr('x', 0)
      .attr('y', 28)
      .attr('width', width)
      .attr('height', 28)
      .attr('fill', '#e5e7eb')
      .attr('rx', 12);
    svg.append('rect')
      .attr('x', 0)
      .attr('y', 28)
      .attr('width', Math.min(width * used / max, width))
      .attr('height', 28)
      .attr('fill', '#34d399')
      .attr('rx', 12);
    svg.append('text')
      .attr('x', width/2)
      .attr('y', 44)
      .attr('text-anchor', 'middle')
      .attr('font-size', 15)
      .attr('fill', '#374151')
      .attr('dominant-baseline', 'middle')
      .text(`${used} MB / ${Math.round(max)} MB`);
  }, [stats]);

  // Uptime Counter (Animated)
  useEffect(() => {
    if (!stats || !uptimeRef.current) return;
    d3.select(uptimeRef.current).selectAll('*').remove();
    const width = 220, height = 60;
    const svg = d3.select(uptimeRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    svg.append('text')
      .attr('x', width/2)
      .attr('y', height/2)
      .attr('text-anchor', 'middle')
      .attr('font-size', 28)
      .attr('fill', '#6366f1')
      .text(`${stats.uptime.toFixed(0)}s`);
    svg.append('text')
      .attr('x', width/2)
      .attr('y', height/2 + 24)
      .attr('text-anchor', 'middle')
      .attr('font-size', 14)
      .attr('fill', '#6b7280')
      .text('Server Uptime');
  }, [stats]);

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
