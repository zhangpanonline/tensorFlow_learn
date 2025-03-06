import * as d3 from 'd3';
import domtoimage from 'dom-to-image';

// 模拟金融交易记录数据
const transactions = [
    { from: '机构A', to: '机构B', time: '2025-03-05', price: 100, amount: 1000 },
    { from: '机构B', to: '机构C', time: '2025-03-05', price: 200, amount: 2000 },
    { from: '机构A', to: '机构C', time: '2025-03-05', price: 150, amount: 1500 }
  ];

  // 提取节点和边
  const nodes = [];
  const links = [];
  transactions.forEach(transaction => {
    if (!nodes.some(node => node.id === transaction.from)) {
      nodes.push({ id: transaction.from });
    }
    if (!nodes.some(node => node.id === transaction.to)) {
      nodes.push({ id: transaction.to });
    }
    links.push({
      source: transaction.from,
      target: transaction.to,
      time: transaction.time,
      price: transaction.price,
      amount: transaction.amount
    });
  });

  // 设置图表尺寸
  const width = 800;
  const height = 600;

  // 创建 SVG 元素
  const svg = d3.select("#chart")
   .append("svg")
   .attr("width", width)
   .attr("height", height);

  // 创建力导向图布局
  const simulation = d3.forceSimulation(nodes)
   .force("link", d3.forceLink(links).id(d => d.id))
   .force("charge", d3.forceManyBody())
   .force("center", d3.forceCenter(width / 2, height / 2));

  // 创建边
  const link = svg.append("g")
   .attr("stroke", "#999")
   .attr("stroke-opacity", 0.6)
   .selectAll("line")
   .data(links)
   .join("line")
   .attr("stroke-width", d => Math.sqrt(d.amount) / 10);

  // 创建节点
  const node = svg.append("g")
   .attr("stroke", "#fff")
   .attr("stroke-width", 1.5)
   .selectAll("circle")
   .data(nodes)
   .join("circle")
   .attr("r", 5)
   .call(drag(simulation));

  // 更新节点和边的位置
  simulation.on("tick", () => {
    link
     .attr("x1", d => d.source.x)
     .attr("y1", d => d.source.y)
     .attr("x2", d => d.target.x)
     .attr("y2", d => d.target.y);

    node
     .attr("cx", d => d.x)
     .attr("cy", d => d.y);
  });

  // 拖动节点的交互
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
     .on("start", dragstarted)
     .on("drag", dragged)
     .on("end", dragended);
  }

  // 导出为图片
  const exportButton = document.getElementById('exportButton');
  exportButton.addEventListener('click', () => {
    domtoimage.toPng(document.getElementById('chart'))
     .then(function (dataUrl) {
        const link = document.createElement('a');
        link.download = 'financial_transaction_network.png';
        link.href = dataUrl;
        link.click();
      })
     .catch(function (error) {
        console.error('图片导出失败:', error);
      });
  });