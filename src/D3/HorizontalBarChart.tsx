import { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import data from './Data'

const HorizontalBarChart = () => {
	const svgRef = useRef<SVGSVGElement | null>(null)
	const [selection, setSelection] = useState<null | d3.Selection<
		SVGSVGElement | null,
		unknown,
		null,
		undefined
	>>(null)

	// const data = dataset.sort(function (a, b) {
	// 	return d3.ascending(a.value, b.value)
	// })

	const svgWidth = 750,
		svgHeight = 750

	const maxValue = d3.max(data, (d) => d.value)

	const x = d3.scaleLinear().domain([0, maxValue!]).range([0, svgHeight])

	const y = d3
		.scaleBand()
		.domain(data.map((d) => d.name))
		.range([0, svgWidth])
		.paddingInner(0.05)

	const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

	useEffect(() => {
		if (!selection) {
			setSelection(d3.select(svgRef.current))
		} else {
			const svg = selection.attr('height', svgHeight).attr('width', svgWidth)

			const bars = svg
				.selectAll('rect')
				.data(data)
				.enter()
				.append('rect')
				.attr('height', y.bandwidth)
				.attr('width', (d) => x(d.value))
				.attr('y', (d) => y(d.name)!)
				.attr('x', (d) => svgHeight - x(d.value))
				.attr('fill', (d) => colorScale(d.name))

			// const text = svg
			// 	.selectAll('text')
			// 	.data(data) //data in waiting state
			// 	.enter()
			// 	.append('text') //takes a string or a function as a param
			// 	.text((d) => d.name)
			// 	.attr('y', (d) => svgHeight - d.value - 2) //subtract extra 2 pixels
			// 	.attr('x', (d, i) => barWidth * i)
			// 	.style('fill', 'blue')
		}
	}, [selection, colorScale, svgHeight, svgWidth, x, y])

	return (
		<div>
			<h1>Bar Chart</h1>
			<svg ref={svgRef} width={900} height={500}></svg>
		</div>
	)
}

export default HorizontalBarChart
