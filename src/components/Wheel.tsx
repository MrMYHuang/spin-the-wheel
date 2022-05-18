import React from 'react';
import { withIonLifeCycle } from '@ionic/react';
import { connect } from 'react-redux';
import * as d3 from 'd3';

import { SelectionItem } from '../models/SelectionItem';
import { Decision } from '../models/Decision';
const padding = { top: 20, right: 20, bottom: 20, left: 20 };
const spins = 3;
const degrees = spins * 360;

// PURE FUNCTIONS
function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

class _Wheel extends React.Component<{
    setSpin: Function,
    setRenderWheel: Function,
    updateSelectedItem: Function,
    decision: Decision | undefined,
}> {
    wheel: d3.Selection<SVGGElement, null, d3.BaseType, unknown> | undefined;

    constructor(props: any) {
        super(props);
        this.props.setSpin(this.spin.bind(this));
        this.props.setRenderWheel(this.renderWheel.bind(this));

        window.addEventListener('resize', () => {
            this.renderWheel();
        });
    }

    componentDidUpdate() {
        this.renderWheel();
    }

    ionViewWillEnter() {
        this.renderWheel();
    }

    get decision() {
        return this.props.decision;
    }

    renderWheel() {
        if (document.querySelector('#chart') == null) {
            return;
        }

        if (this.decision == null) {
            (document.querySelector('#chart') as HTMLElement).hidden = true;
            return;
        }

        (document.querySelector('#chart') as HTMLElement).hidden = false;

        d3.select('#chart').selectChild('svg').remove();

        const chartBoundingClientRect = document.querySelector('#chart')!.getBoundingClientRect();
        const svgWidth = chartBoundingClientRect.width;
        const svgHeight = chartBoundingClientRect.height;
        const width = svgWidth - padding.left - padding.right;
        const height = svgHeight - padding.top - padding.bottom;
        const radius = Math.min(width, height) / 2;
        const color = d3.scaleOrdinal(["#e5dff6", "#e5f6df", "#dfe5f6", "#ebd4f3", "#f6f0df"]);

        let svg: d3.Selection<d3.BaseType, null, d3.BaseType, unknown> = d3.select('#chart')
            .selectAll('svg').data([null])
            .join('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight);

        svg.selectChildren().remove();

        const container = svg.append('g')
            .attr('class', 'chartcontainer')
            .attr('transform', `translate(${width / 2 + padding.left},${height / 2 + padding.top})`);

        this.wheel = container.append('g')
            .attr('class', 'wheel');

        const pie = d3.pie<SelectionItem>().sort(null).value(function (d) { return 1; });

        const arc = d3.arc<d3.PieArcDatum<SelectionItem>>()
            .innerRadius(0)
            .outerRadius(radius);

        const arcs = this.wheel!.selectAll('g.slice')
            .data(pie(this.decision!.selections))
            .enter()
            .append('g')
            .attr('class', 'slice');

        arcs.append('path')
            .attr('fill', function (d, i: number) { return color(i + ''); })
            .attr('d', function (d: d3.PieArcDatum<SelectionItem>) { return arc(d); });

        arcs.append("text").attr("transform", function (d: d3.PieArcDatum<SelectionItem>) {
            //d.innerRadius = 0;
            const outerRadius = radius;
            const angle = (d.startAngle + d.endAngle) / 2;
            return `rotate(${(angle * 180 / Math.PI - 90)})translate(${outerRadius - 10})`;
        })
            .attr("text-anchor", "end")
            .text((d: any, i: number) => {
                //console.log(this.state.data[i].ticker);
                return this.decision!.selections[i].title;
            })
            .style('font-size', this.decision!.fontSize);

        // arrow
        svg.append('g')
            .attr('class', 'arrow')
            .attr('transform', `translate(${(width + padding.left + padding.right) / 2 - 15}, 12)`)
            .append('path')
            .attr('d', `M0 0 H30 L 15 ${Math.sqrt(3) / 2 * 30}Z`)
            .style('fill', '#000809');
    }

    spin() {
        const piedegree = 360 / this.decision!.selections.length;
        const randomAssetIndex = getRandomInt(0, this.decision!.selections.length);
        const randomPieMovement = getRandomInt(1, piedegree);

        const rotation = (this.decision!.selections.length - randomAssetIndex) * piedegree - randomPieMovement + degrees;

        function rotTween() {
            let i = d3.interpolate(0, rotation);
            return function (t: number) {
                return `rotate(${i(t)})`;
            };
        }

        this.wheel?.transition()
            .duration(3000)
            .attrTween('transform', rotTween)
            .ease(d3.easeCircleOut)
            .on('end', () => {

                const result = this.decision!.selections[randomAssetIndex].title;
                //console.log(result);
                this.props.updateSelectedItem(result);
            });
    }

    render() {
        return <div id="chart"></div>;
    }
}

const Wheel = connect((state: any) => {
    return {
        decisions: state.settings.decisions,
        selectedDecision: state.settings.selectedDecision,
    };
})(withIonLifeCycle(_Wheel))

export default Wheel;