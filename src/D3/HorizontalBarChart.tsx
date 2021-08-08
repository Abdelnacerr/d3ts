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

	const barHeight = 70
	const margin = { top: 15, right: 25, bottom: 15, left: 60 }
	const svgWidth = 960 - margin.left - margin.right,
		svgHeight = 500 - margin.left - margin.right
	const maxValue = d3.max(data, (d) => d.value)

	const x = d3
		.scaleLinear()
		.domain([0, maxValue!])
		.range([margin.left, svgWidth - margin.right])

	const y = d3
		.scaleBand()
		.domain(data.map((d) => d.name))
		.rangeRound([margin.top, svgHeight - margin.bottom])
		.paddingInner(0.1)

	const yAxis = d3.axisLeft(y).tickSize(0)

	const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

	useEffect(() => {
		if (!selection) {
			setSelection(d3.select(svgRef.current))
		} else {
			const svg = selection
				.attr('width', svgWidth + margin.left + margin.right)
				.attr('height', svgHeight + margin.top + margin.bottom)
				.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

			const bars = svg
				.selectAll('rect')
				.data(data)
				.enter()
				.append('rect')
				.attr('height', y.bandwidth())
				.attr('width', (d) => x(d.value))
				.attr('y', (d) => y(d.name)!)
				.attr('x', 0)
				.attr('fill', (d) => colorScale(d.name))

			svg
				.append('g')
				.attr('fill', 'black')
				.attr('text-anchor', 'end')
				.attr('font-family', 'sans-serif')
				.attr('font-size', 12)
				.selectAll('text')
				.data(data)
				.join('text')
				.attr('x', (d) => x(d.value)!)
				.attr('y', (d) => y(d.name)! )
				.attr('dy', '1.5em')
				.attr('dx', -4)
				.text((d) => d.value)
				.call((text) =>
					text
						.filter((d) => x(d.value) - x(0) < 20) // short bars
						.attr('dx', +4)
						.attr('fill', 'black')
						.attr('text-anchor', 'start')
				)

			svg.append('g').attr('transform', `translate(0,0)`).call(yAxis)
		}
	}, [selection, colorScale, svgHeight, svgWidth, x, y])

	return (
		<div>
			<h1>Bar Chart</h1>
			<svg ref={svgRef} style={{ background: 'red' }}></svg>
		</div>
	)
}

export default HorizontalBarChart
