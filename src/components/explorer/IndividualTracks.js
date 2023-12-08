import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import {Button, Divider, Modal, Switch, Table, Empty, Skeleton} from "antd";
import { debounce } from "lodash";
import igv from "igv/dist/igv.esm";

import { BENTO_PUBLIC_URL, BENTO_URL } from "../../config";
import { individualPropTypesShape } from "../../propTypes";
import { getIgvUrlsFromDrs } from "../../modules/drs/actions";
import { setIgvPosition } from "../../modules/explorer/actions";
import { guessFileType } from "../../utils/files";
import {useDeduplicatedIndividualBiosamples} from "./utils";
import { useReferenceGenomes } from "../../modules/reference/hooks";
import { useIgvGenomes } from "../../modules/explorer/hooks";

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

// tracks should have a "format" value: "vcf", "cram", "bigWig", etc.
// There is no default value. "If not specified format is inferred from file name extension"
// works if not specified, even from a URL where the filename is obscured, but is much slower
// appears to be case-insensitive

// tracks can also have a "type" property, but this is inferred from the format value

// reduce VISIBILITY_WINDOW above for better performance

// verify url set is for this individual (may have stale urls from previous request)
const hasFreshUrls = (files, urls) => files.every((f) => urls.hasOwnProperty(f.filename));

const isViewable = (file) => {
    const viewable = ["vcf", "cram", "bigwig", "bw"];
    return viewable.includes(file.file_format?.toLowerCase()) || viewable.includes(guessFileType(file.filename));
};

const TrackControlTable = React.memo(({ toggleView, allFoundFiles }) => {
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
    ];  // Don't bother memoizing since toggleView and allFoundFiles both change with allTracks anyway

    return (
        <Table
            bordered
            size="small"
            pagination={false}
            columns={trackTableColumns}
            rowKey="filename"
            dataSource={allFoundFiles}
            style={{ display: "inline-block" }}
        />
    );
});
TrackControlTable.propTypes = {
    toggleView: PropTypes.func,
    allFoundFiles: PropTypes.arrayOf(PropTypes.object),
};

// Right now, a lot of this code uses filenames. This should not be the case going forward,
// as multiple files may have the same name. Everything *should* be done through DRS IDs.
// For now, we treat the filenames as unique identifiers (unfortunately).

const IndividualTracks = ({ individual }) => {
    const { accessToken } = useSelector((state) => state.auth);

    const igvGenomes = useIgvGenomes();  // Built-in igv.js genomes (with annotations)
    const referenceGenomes = useReferenceGenomes();  // Reference service genomes

    const availableBrowserGenomes = useMemo(() => {
        if (!igvGenomes.hasAttempted || !referenceGenomes.hasAttempted) {
            return {};
        }

        const availableGenomes = {};

        // For now, we prefer igv.js built-in genomes with the same ID over local copies for the browser, since it comes
        // with gene annotation tracks. TODO: in the future, this should switch to preferring local copies.
        referenceGenomes.items.forEach((g) => {
            availableGenomes[g] = {
                id: g.id,
                fastaURL: g.fasta,
                indexURL: g.fai,
            };
        });
        (igvGenomes.data ?? []).forEach((g) => availableGenomes[g.id] = g);

        console.debug("total available genomes:", availableGenomes);

        return availableGenomes;
    }, [igvGenomes, referenceGenomes]);

    const igvRef = useRef(null);
    const igvRendered = useRef(false);
    const {igvUrlsByFilename: igvUrls, isFetchingIgvUrls} = useSelector((state) => state.drs);

    // read stored position only on first render
    const igvPosition = useSelector(
        (state) => state.explorer.igvPosition,
        () => true,
    );

    const dispatch = useDispatch();
    const biosamplesData = useDeduplicatedIndividualBiosamples(individual);
    const experimentsData = biosamplesData.flatMap((b) => b?.experiments ?? []);

    const viewableResults = useMemo(
        () =>
            Object.values(
                Object.fromEntries(
                    experimentsData.flatMap((e) => e?.experiment_results ?? [])
                        .filter(isViewable)
                        .map((v) => {  // add properties for visibility and file type
                            const fileFormat = v.file_format?.toLowerCase() ?? guessFileType(v.filename);
                            return [
                                v.filename,
                                {
                                    ...v,
                                    // by default, don't view crams (user can turn them on in track controls):
                                    viewInIgv: fileFormat !== "cram",
                                    file_format: fileFormat,  // re-formatted: to lowercase + guess if missing
                                },
                            ];
                        }),
                ),
            ),
        [experimentsData],
    );

    console.debug("Viewable experiment results:", viewableResults);

    const [allTracks, setAllTracks] = useState(
        viewableResults.sort((r1, r2) => (r1.file_format > r2.file_format ? 1 : -1)),
    );

    const allFoundFiles = useMemo(
        () =>
            allTracks.filter(
                (t) => (igvUrls[t.filename]?.dataUrl && igvUrls[t.filename]?.indexUrl) || igvUrls[t.filename]?.url,
            ),
        [allTracks, igvUrls],
    );

    const [selectedAssemblyID, setSelectedAssemblyID] = useState(null);

    const trackAssemblyIDs = useMemo(
        () => Array.from(new Set(allFoundFiles.map((t) => t.genome_assembly_id))).sort(),
        [allFoundFiles]);

    useEffect(() => {
        if (Object.keys(availableBrowserGenomes).length) {
            if (trackAssemblyIDs.length) {
                const asmID = trackAssemblyIDs[0];  // TODO: first available
                console.debug("auto-selected assembly ID:", asmID)
                setSelectedAssemblyID(asmID);
            }
        }
    }, [availableBrowserGenomes, trackAssemblyIDs]);

    const [modalVisible, setModalVisible] = useState(false);

    const showModal = useCallback(() => setModalVisible(true), []);
    const closeModal = useCallback(() => setModalVisible(false), []);

    const toggleView = useCallback((track) => {
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
            }).catch(console.error);
        }
    }, [allTracks]);

    const storeIgvPosition = useCallback((referenceFrame) => {
        const { chr, start, end } = referenceFrame[0];
        const position = `${chr}:${start}-${end}`;
        dispatch(setIgvPosition(position));
    }, [dispatch]);

    // retrieve urls on mount
    useEffect(() => {
        if (allTracks.length) {
            // don't search if all urls already known
            if (hasFreshUrls(allTracks, igvUrls)) {
                return;
            }
            dispatch(getIgvUrlsFromDrs(allTracks)).catch(console.error);
        }
    }, [allTracks]);

    // update access token whenever necessary
    useEffect(() => {
        if (BENTO_URL) {
            igv.setOauthToken(accessToken, new URL(BENTO_URL).host);
        }
        if (BENTO_PUBLIC_URL) {
            igv.setOauthToken(accessToken, new URL(BENTO_PUBLIC_URL).host);
        }
    }, [accessToken]);

    // render igv when track urls + reference genomes are ready
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

        if (!Object.keys(availableBrowserGenomes).length) {
            return;
        }

        const currentTracks = allFoundFiles.filter((t) => t.viewInIgv && t.genome_assembly_id === selectedAssemblyID);

        const indexedTracks = currentTracks.filter(
            (t) => igvUrls[t.filename].dataUrl && igvUrls[t.filename].indexUrl,
        );

        const unindexedTracks = allFoundFiles.filter((t) => t.viewInIgv && igvUrls[t.filename].url);

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
            genome: availableBrowserGenomes[selectedAssemblyID],
            locus: igvPosition,
            tracks: igvTracks,
        };

        igv.createBrowser(igvRef.current, igvOptions).then((browser) => {
            igv.browser = browser;
            igvRendered.current = true;

            igv.browser.on(
                "locuschange",
                debounce((referenceFrame) => {
                    storeIgvPosition(referenceFrame);
                }, DEBOUNCE_WAIT),
            );
        });
    }, [igvUrls, availableBrowserGenomes, selectedAssemblyID]);

    return (
        <>
            <Button
                icon="setting"
                style={{ marginRight: "8px" }}
                onClick={showModal}
                disabled={!allFoundFiles.length}
                loading={isFetchingIgvUrls}
            >
                Configure Tracks
            </Button>
            <Divider />
            {!allFoundFiles.length && (
                (isFetchingIgvUrls || referenceGenomes.isFetching) ? (
                    <Skeleton title={false} paragraph={{ rows: 4 }} loading={true} />
                ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )
            )}
            <div ref={igvRef} />
            <Modal visible={modalVisible} onOk={closeModal} onCancel={closeModal} zIndex={MODAL_Z_INDEX} width={600}>
                <TrackControlTable toggleView={toggleView} allFoundFiles={allFoundFiles} />
            </Modal>
        </>
    );
};

IndividualTracks.propTypes = {
    individual: individualPropTypesShape,
};

export default IndividualTracks;
