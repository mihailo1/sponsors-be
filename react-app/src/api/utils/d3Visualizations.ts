import * as d3 from "d3";
import cloud from "d3-cloud";
import { WordCloudData } from "../../types";

export function drawWordCloud(strings: WordCloudData[], container: HTMLDivElement | null) {
  if (!container) return;
  const wordCloudData = strings;
  const containerWidth = container.offsetWidth || 800;
  const layout = cloud()
    .size([containerWidth, 400])
    .words(wordCloudData)
    .padding(5)
    .rotate(() => (Math.random() > 0.5 ? 90 : 0))
    .font("Impact")
    .fontSize((d) => d.size || 10)
    .on("end", draw);
  layout.start();
  function draw(words: any) {
    d3.select(container).selectAll("*").remove();
    const svg = d3.select(container)
      .append("svg")
      .attr("width", layout.size()[0])
      .attr("height", layout.size()[1])
      .append("g")
      .attr(
        "transform",
        "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")",
      );
    const color = d3.scaleOrdinal(d3.schemePastel1);
    svg.selectAll("text")
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
      .text((d: any) => d.text)
      .transition()
      .duration(750)
      .attr(
        "transform",
        (d: any) => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")",
      )
      .style("opacity", 1);
  }
}

export function drawRamGauge(stats: any, container: HTMLDivElement | null) {
  if (!stats || !container) return;
  const used = stats.systemMemoryInfo.total - stats.systemMemoryInfo.available;
  const percent = used / stats.systemMemoryInfo.total;
  const width = 180, height = 180, thickness = 30;
  d3.select(container).selectAll('*').remove();
  const svg = d3.select(container)
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
}

export function drawMemoryBar(stats: any, container: HTMLDivElement | null) {
  if (!stats || !container) return;
  const used = stats.memoryUsage;
  const max = stats.systemMemoryInfo.total / 1024;
  const width = 220, height = 64;
  d3.select(container).selectAll('*').remove();
  const svg = d3.select(container)
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
}

export function drawUptime(stats: any, container: HTMLDivElement | null) {
  if (!stats || !container) return;
  d3.select(container).selectAll('*').remove();
  const width = 220, height = 60;
  const svg = d3.select(container)
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
}

export function animateStringsStats(stats: any) {
  if (!stats) return;
  const maxCount = 5000;
  const maxLength = 50;
  const animateValue = (id: string, start: number, end: number, duration: number) => {
    const obj = d3.select(id);
    const interpolator = d3.interpolateNumber(start, end);
    const startTime = Date.now();
    d3.timer(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      obj.text(Math.round(interpolator(progress) * 10) / 10);
      return progress === 1;
    });
  };
  animateValue("#stringsCount", 0, stats.stringsCount, 100);
  animateValue("#averageLength", 0, stats.averageStringLength, 100);
  d3.select("#stringsBar")
    .style("width", (stats.stringsCount / maxCount * 300) + "px");
  d3.select("#lengthBar")
    .style("width", (stats.averageStringLength / maxLength * 300) + "px");
}
