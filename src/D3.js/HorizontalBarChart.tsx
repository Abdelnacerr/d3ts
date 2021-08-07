import React, { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import data from './Data'
import { svg } from 'd3'

const HorizontalBarChart = () => {
	const svgRef = useRef<SVGSVGElement | null>(null)
	const [selection, setSelection] = useState<null | d3.Selection<
		SVGSVGElement | null,
		unknown,
		null,
		undefined
	>>(null)

	const margin = {
		top: 15,
		right: 25,
		bottom: 15,
		left: 60,
	}
	const svgWidth = 960 - margin.left - margin.right,
		svgHeight = 500 - margin.top - margin.bottom

	const maxValue = d3.max(data, (d) => d.value)

	const y = d3.scaleLinear().domain([0, maxValue!]).range([0, svgHeight])

	const x = d3
		.scaleBand()
		.domain(data.map((d) => d.name))
		.range([0, svgWidth])
		.paddingInner(0.02)
		.paddingOuter(0.7)
	const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

	useEffect(() => {
		if (!selection) {
			setSelection(d3.select(svgRef.current))
		} else {
			const svg = selection.attr('height', svgHeight).attr('width', svgWidth)
			svg
				.selectAll('rect')
				.data(data)
				.enter()
				.append('rect')
				.attr('height', (d) => y(d.value))
				.attr('width', x.bandwidth)
				.attr('fill', (d) => colorScale(d.name))
				.attr('x', (d) => {
					const xValue = x(d.name)
					if (xValue) {
						return xValue
					} else {
						return null
					}
				}) //spacing
		}
	}, [selection, colorScale, svgHeight, svgWidth, x, y])
	// console.log(data[0].value)
	return (
		<div>
			<h1>Bar Chart</h1>
			<svg ref={svgRef} width={900} height={500}></svg>
		</div>
	)
}

export default HorizontalBarChart
