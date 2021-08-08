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
	const margin = { top: 30, right: 0, bottom: 10, left: 30 }
	const svgWidth = 750,
		svgHeight =
			Math.ceil((data.length + 0.1) * barHeight) + margin.top + margin.bottom
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
				.attr('height', y.bandwidth() / 2)
				.attr('width', (d) => x(d.value))
				.attr('y', (d) => y(d.name)! / 2)
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
				.attr('y', (d) => y(d.name)! / 2 + 6)
				.attr('dy', '1em')
				.attr('dx', -5)
				.text((d) => d.value)
				.call((text) =>
					text
						.filter((d) => x(d.value) - x(0) < 20) // short bars
						.attr('dx', +4)
						.attr('fill', 'black')
						.attr('text-anchor', 'start')
				)
		}
	}, [selection, colorScale, svgHeight, svgWidth, x, y])

	return (
		<div>
			<h1>Bar Chart</h1>
			<svg ref={svgRef}></svg>
		</div>
	)
}

export default HorizontalBarChart
