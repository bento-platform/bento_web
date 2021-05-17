import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router";
import { polarToCartesian } from "recharts/es6/util/PolarUtils";
import Curve from "recharts/es6/shape/Curve";
import PieChart from "recharts/es6/chart/PieChart";
import Pie from "recharts/es6/polar/Pie";
import Cell from "recharts/es6/component/Cell";
import Sector from "recharts/es6/shape/Sector";

import COLORS from "../../utils/colors";
import { withBasePath } from "../../utils/url";

const RADIAN = Math.PI / 180;

/*
 * lastAngle is mutated by renderLabel() and renderActiveShape() to
 * indicate at which angle is the last shown label.
 */
let lastAngle = 0;

const textStyle = {
    fontSize: "11px",
    fill: "#333",
};
const countTextStyle = {
    fontSize: "10px",
    fill: "#999",
};


class CustomPieChart extends React.Component {
    static propTypes = {
        data: PropTypes.array,
        fieldLabel: PropTypes.string,
        chartWidthHeight: PropTypes.number,
        setAutoQueryPageTransition: PropTypes.func
    }

    state = {
        canUpdate: false,
        activeIndex: undefined,
        //redirect: false,
        itemSelected: undefined,
        graphTerm: undefined,
        fieldLabel: undefined
    }

    onEnter = (_data, index) => {
        this.setState({ activeIndex: index });
    }

    onHover = (_data, _index, e) => {
        e.target.style.cursor = "pointer";
    }

    onLeave = () => {
        this.setState({ activeIndex: undefined });
    }

    onClick = (data) => {
        const { history, setAutoQueryPageTransition } = this.props;

        setAutoQueryPageTransition(
            window.location.href,
            "phenopacket",
            this.props.fieldLabel,
            data.name
        );

        // Navigate to Explorer
        history.push(withBasePath("/data/explorer/search"));
    }

    componentDidMount() {
      /*
       * This ugly hack prevents the Pie labels from not appearing
       * when Pie props change before the end of the animation.
       */
        setTimeout(() => this.setState({ canUpdate: true }), 3000);
    }

    shouldComponentUpdate(props, state) {
        if (this.state !== state && state.canUpdate)
            return true;

        return this.props.data !== props.data;
    }

    render() {
        const { data, chartWidthHeight } = this.props;

        return (
          <PieChart width={chartWidthHeight} height={chartWidthHeight/2}>
              <Pie data={data}
                   dataKey="value"
                   cx="50%"
                   cy="50%"
                   innerRadius={40}
                   outerRadius={80}
                   label={this.renderLabel.bind(this, this.state)}
                   labelLine={true}
                   isAnimationActive={false}
                   onClick={this.onClick}
                   onMouseEnter={this.onEnter}
                   onMouseLeave={this.onLeave}
                   onMouseOver={this.onHover}
                   activeIndex={this.state.activeIndex}
                   activeShape={this.renderActiveLabel.bind(this, this.state)}
              >
                {
                  data.map((entry, index) =>
                  <Cell key={index} fill={COLORS[index % COLORS.length]}/>)
                }
              </Pie>
          </PieChart>
        );
    }

    renderLabel(state, params) {
        const {
            cx,
            cy,
            midAngle,
            // innerRadius,
            outerRadius,
            startAngle,
            endAngle,
            fill,
            payload,
            // value
            index,
        } = params;


        // skip rendering this static label if the sector is selected.
        // this will let the 'renderActiveState' draw without overlapping
        if (index === state.activeIndex) {
            return;
        }

        const name = payload.name === "null" ? "(Empty)" : payload.name;

        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
        const sx = cx + (outerRadius + 10) * cos;
        const sy = cy + (outerRadius + 10) * sin;
        const mx = cx + (outerRadius + 20) * cos;
        const my = cy + (outerRadius + 20) * sin;
        const ex = mx + (cos >= 0 ? 1 : -1) * 22;
        const ey = my;
        const textAnchor = cos >= 0 ? "start" : "end";

        const currentTextStyle = {
            ...textStyle,
            fontWeight: payload.selected ? "bold" : "normal",
            fontStyle: payload.name === "null" ? "italic" : "normal",
        };

        const offsetRadius = 20;
        const startPoint = polarToCartesian(params.cx, params.cy, params.outerRadius, midAngle);
        const endPoint   = polarToCartesian(params.cx, params.cy, params.outerRadius + offsetRadius, midAngle);
        const lineProps = {
            ...params,
            fill: "none",
            stroke: fill,
            points: [startPoint, endPoint],
        };

        if (lastAngle > midAngle)
            lastAngle = 0;


        lastAngle = midAngle;

        return (
        <g>

          { payload.selected &&
            <Sector
              cx={cx}
              cy={cy}
              startAngle={startAngle}
              endAngle={endAngle}
              innerRadius={outerRadius + 6}
              outerRadius={outerRadius + 10}
              fill={fill}
            />
          }

          <Curve
            { ...lineProps }
            type='linear'
            className='recharts-pie-label-line'
          />

          <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill='none'/>
          <circle cx={ex} cy={ey} r={2} fill={fill} stroke='none'/>
          <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey + 3}
                textAnchor={textAnchor}
                style={currentTextStyle}
          >
            { name }
          </text>
          <text
            x={ex + (cos >= 0 ? 1 : -1) * 12}
            y={ey}
            dy={14}
            textAnchor={textAnchor}
            style={countTextStyle}
          >
            {`(${ payload.value } donor${ payload.value > 1 ? "s" : "" })`}
          </text>

        </g>
        );
    }


    renderActiveLabel(state, params) {
        const {
            cx,
            cy,
            midAngle,
            innerRadius,
            outerRadius,
            startAngle,
            endAngle,
            fill,
            payload
        } = params;

        const name = payload.name === "null" ? "(Empty)" : payload.name;

        const offsetRadius = 40;

        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
        const sx = cx + (outerRadius + 10) * cos;
        const sy = cy + (outerRadius + 10) * sin;
        const mx = cx + (outerRadius + offsetRadius) * cos;
        const my = cy + (outerRadius + offsetRadius) * sin;
        const ex = mx + (cos >= 0 ? 1 : -1) * 22;
        const ey = my;
        const textAnchor = cos >= 0 ? "start" : "end";

        const currentTextStyle = {
            ...textStyle,
            fontWeight: "bold",
            fontStyle: payload.name === "null" ? "italic" : "normal",
        };

        const startPoint = polarToCartesian(params.cx, params.cy, params.outerRadius, midAngle);
        const endPoint   = polarToCartesian(params.cx, params.cy, params.outerRadius + offsetRadius, midAngle);
        const lineProps = {
            ...params,
            fill: "none",
            stroke: fill,
            points: [startPoint, endPoint],
        };

        lastAngle = midAngle;

        return (
        <g>

          <Sector
            cx={cx}
            cy={cy}
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill={fill}
          />

          { payload.selected &&
            <Sector
              cx={cx}
              cy={cy}
              startAngle={startAngle}
              endAngle={endAngle}
              innerRadius={outerRadius + 6}
              outerRadius={outerRadius + 10}
              fill={fill}
            />
          }

          <Curve
            { ...lineProps }
            type='linear'
            className='recharts-pie-label-line'
          />

          <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill='none'/>
          <circle cx={ex} cy={ey} r={2} fill={fill} stroke='none'/>
          <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey + 3}
                textAnchor={textAnchor}
                style={currentTextStyle}
          >
            { name }
          </text>
          <text
            x={ex + (cos >= 0 ? 1 : -1) * 12}
            y={ey}
            dy={14}
            textAnchor={textAnchor}
            style={countTextStyle}
          >
            {`(${ payload.value } donor${ payload.value > 1 ? "s" : "" })`}
          </text>

        </g>
        );
    }
}

export default withRouter(CustomPieChart);
