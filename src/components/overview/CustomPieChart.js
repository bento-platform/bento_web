import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import PieChart from "recharts/es6/chart/PieChart";
import Pie from "recharts/es6/polar/Pie";
import Cell from "recharts/es6/component/Cell";
import Tooltip from "recharts/es6/component/Tooltip"
import COLORS from "../../utils/colors";
import { withBasePath } from "../../utils/url";

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

    shouldComponentUpdate(props, state) {
        if (this.state !== state && state.canUpdate)
            return true;

        return this.props.data !== props.data;
    }

    titleStyle = {
        borderBottom: '1px solid black',
        background: "#f6f6f7",
        fontStyle: 'italic',
        padding: "0",
        margin: "0"
    }   

    style = {
        border: '1px solid black',
    }     

    render() {
        const { data, chartWidthHeight, title } = this.props;

        return (
          <div style={this.style}>
          <h2 style={this.titleStyle}>{title}</h2>
          <PieChart width={chartWidthHeight} height={chartWidthHeight/2}>
              <Pie data={data.filter(e => e.value != 0)}
                   dataKey="value"
                   cx="50%"
                   cy="50%"
                   innerRadius={40}
                   outerRadius={80}
                   isAnimationActive={false}
                   onClick={this.onClick}
                   onMouseEnter={this.onEnter}
                   onMouseLeave={this.onLeave}
                   onMouseOver={this.onHover}
                   activeIndex={this.state.activeIndex}
              >
                {
                  data.map((entry, index) =>
                  <Cell key={index} fill={COLORS[index % COLORS.length]}/>)
                }
              </Pie>
              <Tooltip 
                content={<CustomTooltip/>} 
                isAnimationActive={false}
                allowEscapeViewBox={{x: true, y: true}}
              />
          </PieChart>
          </div>
        );
    }

}

const CustomTooltip = ({active, payload, label }) => {

    console.log({active: active, payload: payload, label: label})

    if (!active){
        return null
    }

    const name = payload[0]?.name || ""
    const value = payload[0]?.value || 0
    // const borderColour = payload[0]?.payload.fill 
    
    // inline style for now
    const toolTipStyle = {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: "5px",
        border: "1px solid grey",
        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.9)",
        borderRadius: "2px",
        textAlign: "left"
    }

    const labelStyle = {        
        fontWeight: "bold",
        fontSize: "12px",
        padding: "0",
        margin: "0",
    }

    const countStyle = {
        fontWeight: "normal",
        fontSize: "11px",
        padding: "0",
        margin: "0",
    }

    return <div style={toolTipStyle}>
        <p style={labelStyle}>{name}</p><p style={countStyle}>{value} {`donor${value ==1 ? "" : "s"}`}</p>
    </div>
}

export default withRouter(CustomPieChart);
