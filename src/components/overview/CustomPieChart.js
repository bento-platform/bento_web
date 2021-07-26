import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import PieChart from "recharts/es6/chart/PieChart";
import Pie from "recharts/es6/polar/Pie";
import Cell from "recharts/es6/component/Cell";
import Curve from "recharts/es6/shape/Curve";
import Tooltip from "recharts/es6/component/Tooltip";
import Sector from "recharts/es6/shape/Sector";
import { polarToCartesian } from "recharts/es6/util/PolarUtils";
import COLORS from "../../utils/colors";
import { withBasePath } from "../../utils/url";

const MAX_LABEL_CHARS = 18;
const RADIAN = Math.PI / 180;

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
        chartHeight: PropTypes.number,
        chartAspectRatio: PropTypes.number,
        setAutoQueryPageTransition: PropTypes.func
    }

    state = {
        canUpdate: false,
        activeIndex: undefined,
        itemSelected: undefined,
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
        const { history, setAutoQueryPageTransition, autoQueryDataType } = this.props;

        setAutoQueryPageTransition(
            window.location.href,
            autoQueryDataType,
            this.props.fieldLabel,
            data.name
        );

        // Navigate to Explorer
        history.push(withBasePath("/data/explorer/search"));
    }

  // TODO: is this still needed? If yes, replace with fix
    componentDidMount() {
    /*
     * This ugly hack prevents the Pie labels from not appearing
     * when Pie props change before the end of the animation.
     */
        setTimeout(() => this.setState({ canUpdate: true }), 3000);
    }
  // code to fix ends here

    shouldComponentUpdate(props, state) {
        if (this.state !== state && state.canUpdate)
            return true;

        return this.props.data !== props.data;
    }

    titleStyle = {
        fontStyle: "italic",
        padding: "0",
        margin: "0"
    }

    style = {
        // backgroundColor: "lightgray"
        // margin: '0px 20px 0 0',
    }

    labelShortName(name) {
        if (name.length <= MAX_LABEL_CHARS){
            return name
        }
        return name.substring(0, MAX_LABEL_CHARS) + "..."
    }

    renderLabel(state, params) {
        const {
            cx,
            cy,
            midAngle,
            outerRadius,
            fill,
            payload,
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

        return (
        <g>
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
            { this.labelShortName(name) }
          </text>
          <text
            x={ex + (cos >= 0 ? 1 : -1) * 12}
            y={ey}
            dy={14}
            textAnchor={textAnchor}
            style={countTextStyle}
          >
            {`(${ payload.value })`}
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
        const offsetRadius = 20;
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
            <Sector
              cx={cx}
              cy={cy}
              startAngle={startAngle}
              endAngle={endAngle}
              innerRadius={outerRadius + 6}
              outerRadius={outerRadius + 10}
              fill={fill}
            />
                        {/* <Curve
                { ...lineProps }
                type='linear'
                className='recharts-pie-label-line'
            /> */}

            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill='none'/>
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke='none'/>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey + 3}
                  textAnchor={textAnchor}
                  style={currentTextStyle}
            >
                { this.labelShortName(name) }
            </text>
            <text
                x={ex + (cos >= 0 ? 1 : -1) * 12}
                y={ey}
                dy={14}
                textAnchor={textAnchor}
                style={countTextStyle}
            >
                {`(${ payload.value })`}
            </text>
          </g>
        );
    }


    render() {
        const { data, chartHeight, chartAspectRatio, title } = this.props;
        const titleHeaderHeight = 31;
        const totalCount = data.reduce((sum, e) => sum + e.value, 0);

        return (<>
        <div style={this.style}>
        <h2 style={this.titleStyle}>{title}</h2>
          <PieChart height={chartHeight- titleHeaderHeight} width={(chartHeight-titleHeaderHeight) * chartAspectRatio}>
              <Pie data={data.filter(e => e.value != 0)}
                   dataKey="value"
                   cx="50%"
                   cy="50%"
                   innerRadius={35}
                   outerRadius={80}
                   label={this.renderLabel.bind(this, this.state)}
                   labelLine={false}
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
              <Tooltip
                content={<CustomTooltip totalCount={totalCount}/>}
                isAnimationActive={false}
                allowEscapeViewBox={{x: true, y: true}}
              />
          </PieChart>
          </div>
        </>
        );
    }
}

const CustomTooltip = ({active, payload, totalCount }) => {
    if (!active) {
        return null;
    }

    const name = payload[0]?.name || "";
    const value = payload[0]?.value || 0;
    const percentage = totalCount ? Math.round(value/totalCount * 100) : 0;

    // inline style for now
    const toolTipStyle = {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: "5px",
        border: "1px solid grey",
        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.9)",
        borderRadius: "2px",
        textAlign: "left"
    };

    const labelStyle = {
        fontWeight: "bold",
        fontSize: "12px",
        padding: "0",
        margin: "0",
    };

    const countStyle = {
        fontWeight: "normal",
        fontSize: "11px",
        padding: "0",
        margin: "0",
    };

    return <div style={toolTipStyle}>
        {/* <p style={labelStyle}>{name}</p><p style={countStyle}>{value} {`donor${value ==1 ? "" : "s"}`}</p> */}
        <p style={labelStyle}>{name}</p><p style={countStyle}> {value} ({percentage}%)</p>

    </div>;
};

export default withRouter(CustomPieChart);
