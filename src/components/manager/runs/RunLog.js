import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import PropTypes from "prop-types";

import {AnsiUp} from "ansi_up/ansi_up";

import {Descriptions, Skeleton} from "antd";

import {fetchRunLogStreamsIfPossibleAndNeeded} from "../../../modules/wes/actions";
import {runPropTypesShape} from "../../../propTypes";
import MonospaceText from "@/components/common/MonospaceText";


const ansiUp = new AnsiUp();


const LogOutput = ({log}) => {
    if (log === null) return <Skeleton paragraph={false} />;

    return <div
        style={{fontFamily: "monospace", fontSize: "12px", whiteSpace: "break-spaces", overflowX: "auto"}}
        dangerouslySetInnerHTML={{__html: ansiUp.ansi_to_html(log?.data || "")}}
    />;
};
LogOutput.propTypes = {
    log: PropTypes.shape({
        data: PropTypes.string,
    }),
};

const RunLog = ({run}) => {
    const dispatch = useDispatch();

    const {isFetching: isFetchingRuns, streamsByID: runLogStreams} = useSelector((state) => state.runs);

    useEffect(() => {
        if (isFetchingRuns) return;
        dispatch(fetchRunLogStreamsIfPossibleAndNeeded(run.run_id));
    }, [dispatch, run, isFetchingRuns]);

    const stdout = runLogStreams[run.run_id]?.stdout ?? null;
    const stderr = runLogStreams[run.run_id]?.stderr ?? null;

    const runLog = run?.details?.run_log ?? {};

    return <Descriptions bordered style={{overflow: "auto"}}>
        <Descriptions.Item label="Command" span={3}>
            <span style={{fontFamily: "monospace", fontSize: "12px"}}>{runLog.cmd}</span>
        </Descriptions.Item>
        <Descriptions.Item label="Name" span={2}>
            {runLog.name}
        </Descriptions.Item>
        <Descriptions.Item label="Exit Code" span={1}>
            {runLog.exit_code === null ? "N/A" : runLog.exit_code}
        </Descriptions.Item>
        <Descriptions.Item label={<MonospaceText>stdout</MonospaceText>} span={3}>
            <LogOutput log={stdout} />
        </Descriptions.Item>
        <Descriptions.Item label={<MonospaceText>stderr</MonospaceText>} span={3}>
            <LogOutput log={stderr} />
        </Descriptions.Item>
    </Descriptions>;
};
RunLog.propTypes = {
    run: runPropTypesShape,
};

export default RunLog;
