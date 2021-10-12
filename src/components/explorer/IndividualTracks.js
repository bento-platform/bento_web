import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { individualPropTypesShape } from "../../propTypes";
import { Button, Divider, Modal, Table } from "antd";
import { getIgvUrlsFromDrs } from "../../modules/drs/actions";
import { guessFileType } from "../../utils/guessFileType";
import igv from "igv";

const SQUISHED_CALL_HEIGHT = 10;
const EXPANDED_CALL_HEIGHT = 50;
const DISPLAY_MODE = "expanded";
const VISIBILITY_WINDOW = 60000000;

// IGV notes:

// minimal documentation here: https://github.com/igvteam/igv.js/wiki/Tracks-2.0

// tracks should have a "format" value: "vcf", "cram", "bigWig", etc
// There is no default value. "If not specified format is inferred from file name extension"
// works if not specified, even from a url where the filename is obscured, but is much slower
// appears to be case-insensitive

// tracks can also have a "type" property, but this is inferred from the format value

// reduce VISIBILITY_WINDOW above for better performance


const IndividualTracks = ({ individual }) => {
    const igvRef = useRef(null);
    const igvRendered = useRef(false);
    const igvUrls = useSelector((state) => state.drs.igvUrlsByFilename);
    const isFetchingIgvUrls = useSelector((state) => state.drs.isFetchingIgvUrls);
    const dispatch = useDispatch();

    const biosamplesData = (individual?.phenopackets ?? []).flatMap((p) => p.biosamples);
    const experimentsData = biosamplesData.flatMap((b) => b?.experiments ?? []);
    let viewableResults = experimentsData.flatMap((e) => e?.experiment_results ?? []).filter(isViewable);

  // add property for viewing / hiding tracks
    viewableResults = viewableResults.map((v) => {
        return { ...v, viewInIgv: "true" };
    });

  // enforce having a file_format property
    viewableResults = viewableResults.map((v) => {
        return { ...v, file_format: v.file_format ?? guessFileType(v.filename) };
    });

    const [allTracks, setAllTracks] = useState(
        viewableResults.sort((r1, r2) => (r1.file_format > r2.file_format ? 1 : -1))
    );
    
    const [modalVisible, setModalVisible] = useState(false);

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

    // hardcode for hg19/GRCh37, fix requires updates elsewhere in Bento
    const genome = "hg19";

    // verify url set is for this individual (may have stale urls from previous request)
    const hasFreshUrls = (files, urls) => files.every((f) => urls.hasOwnProperty(f.filename));

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
            tracks: igvTracks,
        };

        igv.createBrowser(igvRef.current, igvOptions).then(function (browser) {
            igv.browser = browser;
            igvRendered.current = true;
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
            key: "creation_date",
            render: (_, track) => track.description,
        },
        {
            title: "View",
            key: "view",
            align: "center",
            render: (_, track) => (
        <Button onClick={() => toggleView(track)} style={{ color: track.viewInIgv ? "blue" : "gray" }}>
          {track.viewInIgv ? "viewing" : "hidden"}
        </Button>
            ),
        },
    ];

    const TrackControlModal = () => {
        return <Table
        bordered
        size="small"
        pagination={false}
        columns={TRACK_TABLE_COLUMNS}
        rowKey="filename"
        dataSource={allTracks}
        style={{ display: "inline-block" }}
      />;
    };

    return (
        <>
        <Button
          icon="profile"
          style={{ marginRight: "8px" }}
          onClick={() => setModalVisible(true)}
        >
          Configure Tracks
        </Button>
        <div ref={igvRef} />
        <Divider />
        <Modal visible={modalVisible} footer={null} onCancel={() => setModalVisible(false)}>
          <TrackControlModal />
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
