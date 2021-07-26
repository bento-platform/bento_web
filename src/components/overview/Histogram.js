import React from "react"
import PropTypes from "prop-types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Label,
} from "recharts";

class Histogram extends React.Component {
  static propTypes = {
    data: PropTypes.array,
    fieldLabel: PropTypes.string,
    chartHeight: PropTypes.number,
    chartAspectRatio: PropTypes.number,
    setAutoQueryPageTransition: PropTypes.func,
  };

  state = {
    canUpdate: false,
    activeIndex: undefined,
    itemSelected: undefined,
    fieldLabel: undefined,
  };

  titleStyle = {
    fontStyle: "italic",
    padding: "0",
    margin: "0",
  };

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
    if (this.state !== state && state.canUpdate) return true;

    return this.props.data !== props.data;
  }

  render() {
    const {title, data, chartHeight, chartAspectRatio} = this.props
    const titleHeaderHeight = 31;
    
    return (
      <div>
        <h2 style={this.titleStyle}>{title}</h2>
        <BarChart
          width={(chartHeight- titleHeaderHeight) * chartAspectRatio}
          height={chartHeight - titleHeaderHeight}
          data={data}
          margin={{ top: 50, right: 80, bottom: 30, left: 80 }}
        >
          <XAxis dataKey="ageBin" height={20}>
            <Label value="Subject age (yrs)" offset={-20} position="insideBottom" />
          </XAxis>
          <YAxis >
            <Label value="Count" offset={-10} position="left" angle={270} />
          </YAxis>
          <Tooltip />
          <Bar dataKey="count" fill="#ff0000" isAnimationActive={false} />
        </BarChart>
      </div>
    );
  }
}

export default Histogram;
