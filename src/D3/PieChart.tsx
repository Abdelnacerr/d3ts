import { FC, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { StateDefinition } from '../../../../store/reducer'
import useExposedService from '../../helpers/useExposedService'
import * as d3 from 'd3'
import useStyles from '../styles/D3Charts'
import { FormattedMessage } from 'react-intl'

import Location from '../../../location-management/models/location'
import ScheduleEvent from '../../../scheduling/models/scheduleEvent'
import ScheduleEventStatus from '../../../scheduling/models/scheduleEventStatus'
import statusColors from '../../../../styles/customPalette/statuses'

interface Props {
	startDate?: string
	endDate?: string
}

interface EventsChartData {
	name: string
	eventCount: number
	[key: string]: number | string | ScheduleEvent[]
}
;[]

const width = 800
const height = 400

function getChartData(
	eventsByDateRange: {
		events: ScheduleEvent[]
		statuses: ScheduleEventStatus[]
	}[],
	locations: Location[]
) {
	let records: EventsChartData[]
	let undefinedEventLocations: any

	undefinedEventLocations = eventsByDateRange[0].events.filter(
		(event) => event.assignedLocations.length === 0
	)
	console.log(eventsByDateRange)
	console.log(undefinedEventLocations)

	records = locations.map((location: any) => ({
		name: location.text,
		eventCount: eventsByDateRange[0].events.filter(
			(event) =>
				event.assignedLocations.some(
					(assignedLocation) => assignedLocation.locationId === location.id
				)
			// || event.assignedLocations === undefined
		).length,
	}))

	records = records.filter((location) => location.eventCount)

	const columns = eventsByDateRange[0].statuses.map((status) => status.name)

	const colors: {
		[key: string]: string
	} = eventsByDateRange[0].statuses.reduce(
		(obj: { [key: string]: string }, status) => {
			obj[status.name] = statusColors[status.color]
			return obj
		},
		{}
	)

	return {
		records,
		columns,
		colors,
		undefinedEventLocations,
	}
}
const currentDate = new Date().toISOString().split('T')[0]

const PieChart: FC<Props> = ({
	startDate = '2021-05-07T14:00:00.000Z',
	endDate = '2021-11-10T14:00:00.000Z',
	//startDate = currentDate,
	// endDate = currentDate,
}): JSX.Element => {
	const classes = useStyles()
	const { getEventsByDateRange, getLocations } = useExposedService()
	const pieChart = useRef<SVGSVGElement | null>(null)
	const [selection, setSelection] = useState<null | d3.Selection<
		SVGSVGElement | null,
		unknown,
		null,
		undefined
	>>(null)
	const {
		eventsByDateRange,
		locations,
	}: {
		eventsByDateRange: {
			events: ScheduleEvent[]
			statuses: ScheduleEventStatus[]
		}[]
		locations: Location[]
	} = useSelector((state: StateDefinition) => state.core)

	const d3Chart = useRef<SVGSVGElement | null>(null)

	useEffect(() => {
		getEventsByDateRange(startDate, endDate)
		getLocations()
	}, [startDate, endDate])

	useEffect(() => {
		if (!eventsByDateRange.length || !locations.length) return

		const chartData = getChartData(eventsByDateRange, locations)
		console.log(chartData.records)

		if (!selection) {
			setSelection(d3.select(pieChart.current))
		} else {
			const piedata = d3
				.pie()
				.sort(null)
				.value((d: any) => d.eventCount)(chartData.records as any)
			const radius = 170
			const arc: any = d3.arc().innerRadius(0).outerRadius(radius)

			const colors = d3.scaleOrdinal([
				'#E58C05',
				'#134e6f',
				'#ff6150',
				'#1ac0c6',
				'#dee08f',
			])
			const svg = selection
				.attr('viewBox', `0 0 ${width} ${height}`)
				.append('g')
				.attr('transform', 'translate(400,200)')

			// Draw pie
			svg
				.append('g')
				.selectAll('path')
				.data(piedata)
				.join('path')
				.attr('d', arc)
				.attr('fill', (d, i: any) => colors(i))
				.attr('stroke', 'white')

			svg
				.append('g')
				.selectAll('text')
				.data(piedata)
				.enter()
				.append('text')
				.attr('transform', function (d: any) {
					const _d = arc.centroid(d)
					_d[0] *= 1.5
					_d[1] *= 1.5
					return 'translate(' + _d + ')'
				})
				.attr('dy', '.50em')
				.style('text-anchor', 'middle')
				.style('font-size', 13)
				.attr('fill', 'grey[900]')
				.style('font-weight', '400')
				.text(function (d: any) {
					return d.data.name
				})

			svg
				.append('g')
				.selectAll('text')
				.data(piedata)
				.enter()
				.append('text')
				.attr('transform', function (d: any) {
					const _d = arc.centroid(d)
					_d[0] *= 0.9
					_d[1] *= 0.9
					return 'translate(' + _d + ')'
				})

				.attr('dy', '.50em')
				.style('text-anchor', 'middle')
				.style('font-size', 13)
				.attr('fill', 'grey[900]')
				.style('font-weight', '400')
				.text(function (d: any) {
					return d.data.eventCount
				})
		}
	}, [eventsByDateRange, locations])

	return (
		<div className={classes.ChartHeader}>
			<FormattedMessage id='events-by-location' />
			<svg ref={pieChart}></svg>
		</div>
	)
}

export default PieChart
