import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { individualPropTypesShape } from "../../propTypes";
import { Button, Divider, Modal, Switch, Table } from "antd";
import { getIgvUrlsFromDrs } from "../../modules/drs/actions";
import { guessFileType } from "../../utils/guessFileType";
import igv from "igv";

const SQUISHED_CALL_HEIGHT = 10;
const EXPANDED_CALL_HEIGHT = 50;
const DISPLAY_MODE = "expanded";
const VISIBILITY_WINDOW = 60000000;

// highest z-index in IGV is 4096, modal z-index needs to be higher
const MODAL_Z_INDEX = 5000;

// IGV notes:

// minimal documentation here: https://github.com/igvteam/igv.js/wiki/Tracks-2.0

// tracks should have a "format" value: "vcf", "cram", "bigWig", etc
// There is no default value. "If not specified format is inferred from file name extension"
// works if not specified, even from a url where the filename is obscured, but is much slower
// appears to be case-insensitive

// tracks can also have a "type" property, but this is inferred from the format value

// reduce VISIBILITY_WINDOW above for better performance


const IndividualTracks = ({ individual, igvLocus, setIgvLocus }) => {
    const igvRef = useRef(null);
    const igvRendered = useRef(false);
    const igvUrls = useSelector((state) => state.drs.igvUrlsByFilename);
    const isFetchingIgvUrls = useSelector((state) => state.drs.isFetchingIgvUrls);
    const dispatch = useDispatch();

    const biosamplesData = (individual?.phenopackets ?? []).flatMap((p) => p.biosamples);
    const experimentsData = biosamplesData.flatMap((b) => b?.experiments ?? []);
    let viewableResults = experimentsData.flatMap((e) => e?.experiment_results ?? []).filter(isViewable);

    // add properties for visibility and file type
    viewableResults = viewableResults.map((v) => {
        return { ...v, viewInIgv: true, file_format: v.file_format ?? guessFileType(v.filename) };
    });

    const [allTracks, setAllTracks] = useState(
        viewableResults.sort((r1, r2) => (r1.file_format > r2.file_format ? 1 : -1))
    );

    const allFoundFiles = allTracks.filter(
        (t) => (igvUrls[t.filename]?.dataUrl && igvUrls[t.filename]?.indexUrl) || igvUrls[t.filename]?.url);

    const [modalVisible, setModalVisible] = useState(false);

    // hardcode for hg19/GRCh37, fix requires updates elsewhere in Bento
    const genome = "hg19";

    // verify url set is for this individual (may have stale urls from previous request)
    const hasFreshUrls = (files, urls) => files.every((f) => urls.hasOwnProperty(f.filename));

    const toggleView = (track) => {
        const wasViewing = track.viewInIgv;
        const updatedTrackObject = { ...track, viewInIgv: !wasViewing };
        setAllTracks(allTracks.map((t) => (t.filename === track.filename ? updatedTrackObject : t)));

        if (wasViewing) {
            igv.browser.removeTrackByName(track.filename);
        } else {
            igv.browser.loadTrack({
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

    // render igv when track urls ready
    useEffect(() => {
        if (isFetchingIgvUrls) {
            console.log("useEffect: still fetching");
            return;
        } else {
            console.log("useEffect: not fetching");
        }

        if (!allTracks.length || !hasFreshUrls(allTracks, igvUrls) || igvRendered.current) {
            console.log("urls not ready");
            console.log({ igvUrls: igvUrls });
            console.log({ tracksValid: hasFreshUrls(allTracks, igvUrls) });
            console.log({ igvRendered: igvRendered.current });
            return;
        }

        console.log("rendering igv");

        // TODO: tracks config for unindexed files

        const currentTracks = allTracks.filter(
            (t) => t.viewInIgv && igvUrls[t.filename].dataUrl && igvUrls[t.filename].indexUrl
        );
        const igvTracks = currentTracks.map((t) => ({
            format: t.file_format,
            url: igvUrls[t.filename].dataUrl,
            indexURL: igvUrls[t.filename].indexUrl,
            name: t.filename,
            squishedCallHeight: SQUISHED_CALL_HEIGHT,
            expandedCallHeight: EXPANDED_CALL_HEIGHT,
            displayMode: DISPLAY_MODE,
            visibilityWindow: VISIBILITY_WINDOW,
        }));

        const igvOptions = {
            genome: genome,
            locus: igvLocus, //zooms out if null
            tracks: igvTracks,
        };

        igv.createBrowser(igvRef.current, igvOptions).then( (browser) => {
            igv.browser = browser;
            igvRendered.current = true;

            // code for monitoring user IGV changes, TODO
            // igv.browser.on('locuschange', (referenceFrame) => {
            //     console.log({referenceFrame: referenceFrame});
            // });
        });
    }, [igvUrls]);

    const TRACK_TABLE_COLUMNS = [
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
        columns={TRACK_TABLE_COLUMNS}
        rowKey="filename"
        dataSource={allFoundFiles}
        style={{ display: "inline-block" }}
      />;
    };

    return (
        <>
        {Boolean(allFoundFiles.length) && (
          <Button icon="setting" style={{ marginRight: "8px" }} onClick={() => setModalVisible(true)}>
            Configure Tracks
          </Button>
        )}
        <div ref={igvRef} />
        <Divider />
        <Modal
          visible={modalVisible}
          onOk={() => setModalVisible(false)}
          onCancel={() => setModalVisible(false)}
          zIndex={MODAL_Z_INDEX}
        >
          <TrackControlTable />
        </Modal>
        </>
    );
};

IndividualTracks.propTypes = {
    individual: individualPropTypesShape,
};

// expand here to include more file types
function isViewable(file) {
    if (file.file_format?.toLowerCase() === "vcf" || guessFileType(file.filename) === "vcf") {
        return true;
    }
  // if(file.file_format?.toLowerCase() === "cram" || guessFileType(file.filename) === 'cram'){
  //   return true
  // }
}

export default IndividualTracks;
