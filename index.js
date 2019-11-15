
const width = 1200, 
        height = 800

d3.csv('data.csv').then((data) => {
    data = data.filter(d => d.source !== 'na')
    console.log(data)
    
    // get unique names
    const names = []

    for (let i = 0; i < data.length; i++) {
        const name1 = data[i].source
        const name2 = data[i].target
       
        if (!names.includes(name1)) {
            names.push(name1)
        }

        if (!names.includes(name2)) {
            names.push(name2)
        }
    }

    const colors = d3.scaleOrdinal()
        .domain(names)
        .range(d3.schemeSet2)

    const nameToIndex = {}
    names.forEach((d,i) => {
        nameToIndex[d] = i
    })

    data = data.map((d) => {
        return {
            source: nameToIndex[d.source],
            target: nameToIndex[d.target]
        }
    })
    
    const nodes = names.map((name, i) => { 
        return {
            "id": name,
            index: i,
            x: getRandomBetween(width/3, width*2/3),
            y: getRandomBetween(height/3, height*2/3)
        }
    })

    const svg = d3.select('body').append('svg')
        .attr('width', width)
        .attr('height', height)

    const nameNodes = svg.selectAll('text')
        .data(nodes)
        .enter()
        .append('text')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .text(d => d.id)
            .style('font-size', '14pt')
            .style('fill', '#ccc')
            .on('mouseover', function(d) {
                // d3.select(this).style('fill', 'black')
                console.log(d)
                let adj = data.filter((o) => o.source.id == d.id || o.target.id == d.id)
                adj = adj.map(o => o.target.id)
                adj.push(d.id)
                
                
                d3.selectAll('text').style('fill', function(o) {
                    return adj.includes(o.id) || o.id == d.id ? 'black' : '#ccc'
                })
                const name = d3.select(this).text()
                const s = d3.selectAll('line')
                .style('opacity', function(o) {
                    return o.source.id == name || o.target.id == name ? '1' : '0.5'
                })
                .style('stroke-width', function(o) {
                    return o.source.id == name || o.target.id == name ? '2' : '1'
                })

            })
            .on('mouseout', function() {
                d3.selectAll('text').style('fill', '#ccc')
                d3.selectAll('line')
                    .transition()
                    .style('opacity', '0.5')
                    .style('stroke-width', '1')
            })

        

    

    // let linkForce = d3.forceLink(data).distance(300).strength(1)

    // let simulation = d3.forceSimulation(nodes).alphaDecay(0.01).force("linkForce",linkForce);
    // simulation.on("tick", () => {
    //     nameNodes.attr('x', d => d.x)
    //         .attr('y', d => d.y)
    // })

    var simulation = d3.forceSimulation(nodes)
  .force('charge', d3.forceManyBody().strength(-100))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force('link', d3.forceLink().distance(150).links(data))
  .on('tick', ticked);

  let iter = 0;

function updateLinks() {
    const plotNames = []

  var u = svg
    .selectAll('line')
    .data(data)

  u.enter()
    .append('line')
    .merge(u)
    .attr('x1', function(d) {
      return d.source.x
    })
    .attr('y1', function(d) {
      return d.source.y
    })
    .attr('x2', function(d) {
      return d.target.x
    })
    .attr('y2', function(d) {
      return d.target.y
    })
    .style('stroke', d => {
        if (iter > 0) {
            if (!plotNames.includes(d.source.id)) {
                plotNames.push(d.source.id)
            }
        }
        iter++
        return colors(d.source.id)
    })
    .style('opacity', 0.5)
    .style('pointer-events', 'none')
    
    if (iter == data.length) {
        svg.selectAll("mydots")
        .data(plotNames)
        .enter()
        .append("circle")
            .attr("cx", width - 100)
            .attr("cy", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 7)
            .style("fill", function(d){ return colors(d)})

        // Add one dot in the legend for each name.
        svg.selectAll("mylabels")
            .data(plotNames)
            .enter()
            .append("text")
                .attr("x", width - 100)
                .attr("y", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
                .style("fill", function(d){ return colors(d)})
                .text(function(d){ return d})
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")
    }
  
    u.exit().remove()
}

function updateNodes() {
  u = svg
    .selectAll('text')
    .data(nodes)

  u.enter()
    .append('text')
    .text(function(d) {
      return d.id
    })
    .merge(u)
    .attr('x', function(d) {
      return d.x
    })
    .attr('y', function(d) {
      return d.y
    })
    .attr('dy', function(d) {
      return 5
    })
    

  u.exit().remove()
}

function ticked() {
  updateLinks()
  updateNodes()
}




})

function getRandomBetween(x,y) {
    return Math.floor(Math.random()*y) + x
}