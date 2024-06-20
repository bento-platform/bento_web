import React from "react";
import PropTypes from "prop-types";
import { Col, Spin, Statistic } from "antd";

const StatisticCollection = React.memo(({ statistics, isFetching }) => {
  return (
    <>
      {statistics.map((s, i) => (
        <Col key={i} xl={2} lg={3} md={5} sm={6} xs={10}>
          <Spin spinning={isFetching}>
            <Statistic title={s.title} value={s.value} />
          </Spin>
        </Col>
      ))}
    </>
  );
});
StatisticCollection.propTypes = {
  statistics: PropTypes.arrayOf(PropTypes.shape({ title: PropTypes.string, value: PropTypes.number })),
  isFetching: PropTypes.bool,
};

export default StatisticCollection;
