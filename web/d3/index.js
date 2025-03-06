import * as d3 from 'd3'
import domtoimage from 'dom-to-image';

const transactions = [
    { from: '机构A', to: '机构B', time: '2025-03-05', price: 100, amount: 1000 },
    { from: '机构B', to: '机构C', time: '2025-03-05', price: 200, amount: 2000 },
    { from: '机构A', to: '机构C', time: '2025-03-05', price: 150, amount: 1500 }
  ];

const nodes = [...new Set(transactions.flatMap(o => [o.from, o.to]))].map(id => ({id}))
const links = transactions.map(o => ({ ...o, source: o.from, target: o.to }))

const width = 800
const height = 600

const svg = d3.select("#chart").append('svg').attr('width', width).attr('height', height)

const link = svg.append('g')
  .attr('stroke', '#999')
  .attr('stroke-opacity', 0.6)
  .selectAll('line')
  .data(links)
  .join('line')
  .attr('stroke-width', d => Math.sqrt(d.amount) / 10)

const simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(links).id(d => d.id))
  .force('charge', d3.forceManyBody())
  .force('center', d3.forceCenter(width / 2, height / 2))

const node = svg.append('g')
  .attr('stroke', '#fff')
  .attr('stroke-width', 1.5)
  .selectAll('circle')
  .data(nodes)
  .join('circle')
  .attr('r', 5)
  .call(drag(simulation));

simulation.on('tick', e => {
  link
   .attr('x1', d => d.source.x)
   .attr('y1', d => d.source.y)
   .attr('x2', d => d.target.x)
   .attr('y2', d => d.target.y)

  node.attr('cx', d => d.x).attr('cy', d => d.y)
  })

function drag(simulation) {
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
  return d3.drag()
   .on('start', dragstarted)
   .on('drag', dragged)
   .on('end', dragended)
}