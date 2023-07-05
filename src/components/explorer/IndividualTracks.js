import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { individualPropTypesShape } from "../../propTypes";
import { Button, Divider, Modal, Switch, Table, Empty } from "antd";
import { getIgvUrlsFromDrs } from "../../modules/drs/actions";
import { guessFileType } from "../../utils/guessFileType";
import { setIgvPosition } from "../../modules/explorer/actions";
import { debounce } from "lodash";
import igv from "igv/dist/igv.esm";

import { BENTO_PUBLIC_URL, BENTO_URL } from "../../config";
const SQUISHED_CALL_HEIGHT = 10;
const EXPANDED_CALL_HEIGHT = 50;
const DISPLAY_MODE = "expanded";
const VISIBILITY_WINDOW = 600000;

// highest z-index in IGV is 4096, modal z-index needs to be higher
const MODAL_Z_INDEX = 5000;

// listening to igv's "locuschange" event can produce a very large number of calls
// storing in redux on every call gives terrible performance
// so ignore everything except the last call over a particular time frame (in ms)
const DEBOUNCE_WAIT = 500;

// IGV notes:

// minimal documentation here: https://github.com/igvteam/igv.js/wiki/Tracks-2.0

// tracks should have a "format" value: "vcf", "cram", "bigWig", etc
// There is no default value. "If not specified format is inferred from file name extension"
// works if not specified, even from a url where the filename is obscured, but is much slower
// appears to be case-insensitive

// tracks can also have a "type" property, but this is inferred from the format value

// reduce VISIBILITY_WINDOW above for better performance


const IndividualTracks = ({individual}) => {
    const {accessToken} = useSelector(state => state.auth);

    const igvRef = useRef(null);
    const igvRendered = useRef(false);
    const igvUrls = useSelector((state) => state.drs.igvUrlsByFilename);
    const isFetchingIgvUrls = useSelector((state) => state.drs.isFetchingIgvUrls);

    // read stored position only on first render
    const igvPosition = useSelector((state) => state.explorer.igvPosition, () => true);

    const dispatch = useDispatch();
    const biosamplesData = (individual?.phenopackets ?? []).flatMap((p) => p.biosamples);
    const experimentsData = biosamplesData.flatMap((b) => b?.experiments ?? []);
    let viewableResults = experimentsData.flatMap((e) => e?.experiment_results ?? []).filter(isViewable);

    // add properties for visibility and file type
    viewableResults = viewableResults.map((v) => {
        return { ...v, viewInIgv: true, file_format: v.file_format?.toLowerCase() ?? guessFileType(v.filename) };
    });

    // by default, don't view crams (user can turn them on in track controls)
    viewableResults = viewableResults.map((v) => {
        return v.file_format.toLowerCase() === "cram" ? {...v, viewInIgv: false} : v;
    });

    const [allTracks, setAllTracks] = useState(
        viewableResults.sort((r1, r2) => (r1.file_format > r2.file_format ? 1 : -1)),
    );

    const allFoundFiles = allTracks.filter(
        (t) => (igvUrls[t.filename]?.dataUrl && igvUrls[t.filename]?.indexUrl) || igvUrls[t.filename]?.url);

    const [modalVisible, setModalVisible] = useState(false);

    // hardcode for hg19/GRCh37, fix requires updates elsewhere in Bento
    const genome = "hg19";

    // verify url set is for this individual (may have stale urls from previous request)
    const hasFreshUrls = (files, urls) => files.every((f) => urls.hasOwnProperty(f.filename));

    const toggleView = async (track) => {
        const wasViewing = track.viewInIgv;
        const updatedTrackObject = { ...track, viewInIgv: !wasViewing };
        setAllTracks(allTracks.map((t) => (t.filename === track.filename ? updatedTrackObject : t)));

        if (wasViewing) {
            igv.browser.removeTrackByName(track.filename);
        } else {
            // noinspection JSUnusedGlobalSymbols
            await igv.browser.loadTrack({
                format: track.file_format,
                url: igvUrls[track.filename].dataUrl,
                indexURL: igvUrls[track.filename].indexUrl,
                name: track.filename,
                squishedCallHeight: SQUISHED_CALL_HEIGHT,
                expandedCallHeight: EXPANDED_CALL_HEIGHT,
                displayMode: DISPLAY_MODE,
                visibilityWindow: VISIBILITY_WINDOW,
            });
        }
    };

    const storeIgvPosition = (referenceFrame) => {
        const {chr, start, end} = referenceFrame[0];
        const position = `${chr}:${start}-${end}`;
        dispatch(setIgvPosition(position));
    };

    // retrieve urls on mount
    useEffect(() => {
        if (allTracks.length) {
      // don't search if all urls already known
            if (hasFreshUrls(allTracks, igvUrls)) {
                return;
            }
            dispatch(getIgvUrlsFromDrs(allTracks));
        }
    }, []);

    // update access token whenever necessary
    useEffect(() => {
        if (BENTO_URL) {
            igv.setOauthToken(accessToken, (new URL(BENTO_URL)).host);
        }
        if (BENTO_PUBLIC_URL) {
            igv.setOauthToken(accessToken, (new URL(BENTO_PUBLIC_URL)).host);
        }
    }, [accessToken]);

    // render igv when track urls ready
    useEffect(() => {
        if (isFetchingIgvUrls) {
            return;
        }

        if (!allFoundFiles.length || !hasFreshUrls(allTracks, igvUrls) || igvRendered.current) {
            console.log("urls not ready");
            console.log({ igvUrls: igvUrls });
            console.log({ tracksValid: hasFreshUrls(allTracks, igvUrls) });
            console.log({ igvRendered: igvRendered.current });
            return;
        }

        const indexedTracks = allFoundFiles.filter(
            (t) => t.viewInIgv && igvUrls[t.filename].dataUrl && igvUrls[t.filename].indexUrl,
        );

        const unindexedTracks = allFoundFiles.filter(
            (t) => t.viewInIgv && igvUrls[t.filename].url,
        );

        const igvIndexedTracks = indexedTracks.map((t) => ({
            format: t.file_format,
            url: igvUrls[t.filename].dataUrl,
            indexURL: igvUrls[t.filename].indexUrl,
            name: t.filename,
            squishedCallHeight: SQUISHED_CALL_HEIGHT,
            expandedCallHeight: EXPANDED_CALL_HEIGHT,
            displayMode: DISPLAY_MODE,
            visibilityWindow: VISIBILITY_WINDOW,
        }));

        const igvUnindexedTracks = unindexedTracks.map((t) => ({
            format: t.file_format,
            url: igvUrls[t.filename].url,
            name: t.filename,
            squishedCallHeight: SQUISHED_CALL_HEIGHT,
            expandedCallHeight: EXPANDED_CALL_HEIGHT,
            displayMode: DISPLAY_MODE,
            visibilityWindow: VISIBILITY_WINDOW,
        }));

        const igvTracks = igvUnindexedTracks.concat(igvIndexedTracks);

        const igvOptions = {
            genome: genome,
            locus: igvPosition,
            tracks: igvTracks,
        };

        igv.createBrowser(igvRef.current, igvOptions).then( (browser) => {
            igv.browser = browser;
            igvRendered.current = true;

            igv.browser.on("locuschange", debounce((referenceFrame) => {
                storeIgvPosition(referenceFrame);
            }, DEBOUNCE_WAIT));
        });
    }, [igvUrls]);

    const trackTableColumns = [
        {
            title: "File",
            key: "filename",
            render: (_, track) => track.filename,
        },
        {
            title: "File type",
            key: "fileType",
            render: (_, track) => track.description,
        },
        {
            title: "View track",
            key: "view",
            align: "center",
            render: (_, track) => <Switch checked={track.viewInIgv} onChange={() => toggleView(track)} />,
        },
    ];

    const TrackControlTable = () => {
        return <Table
        bordered
        size="small"
        pagination={false}
        columns={trackTableColumns}
        rowKey="filename"
        dataSource={allFoundFiles}
        style={{ display: "inline-block" }}
      />;
    };

    return (
        <>
        {allFoundFiles.length ? (
          <Button icon="setting" style={{ marginRight: "8px" }} onClick={() => setModalVisible(true)}>
            Configure Tracks
          </Button>
        ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
        <div ref={igvRef} />
        <Divider />
        <Modal
          visible={modalVisible}
          onOk={() => setModalVisible(false)}
          onCancel={() => setModalVisible(false)}
          zIndex={MODAL_Z_INDEX}
          width={600}
        >
          <TrackControlTable />
        </Modal>
        </>
    );
};

IndividualTracks.propTypes = {
    individual: individualPropTypesShape,
};

function isViewable(file) {
    const viewable = ["vcf", "cram", "bigwig", "bw"];
    if (viewable.includes(file.file_format?.toLowerCase()) || viewable.includes(guessFileType(file.filename))) {
        return true;
    }
    return false;
}

export default IndividualTracks;
