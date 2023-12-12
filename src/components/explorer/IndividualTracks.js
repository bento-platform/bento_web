import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Button, Divider, Modal, Switch, Table, Empty, Skeleton, message } from "antd";
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

const ALIGNMENT_FORMATS_LOWER = ["bam", "cram"];
const ANNOTATION_FORMATS_LOWER = ["bigbed"];  // TODO: experiment result: support more
const MUTATION_FORMATS_LOWER = ["maf"];
const WIG_FORMATS_LOWER = ["bigwig"];  // TODO: experiment result: support wig/bedGraph?
const VARIANT_FORMATS_LOWER = ["vcf", "gvcf"];
const VIEWABLE_FORMATS_LOWER = [
    ...ALIGNMENT_FORMATS_LOWER,
    ...ANNOTATION_FORMATS_LOWER,
    ...MUTATION_FORMATS_LOWER,
    ...WIG_FORMATS_LOWER,
    ...VARIANT_FORMATS_LOWER,
];

const expResFileFormatLower = (expRes) => expRes.file_format?.toLowerCase() ?? guessFileType(expRes.filename);

// For an experiment result to be viewable in IGV.js, it must have:
//  - an assembly ID, so we can contextualize it correctly
//  - a file format in the list of file formats we know how to handle
const isViewableInIgv = (expRes) =>
    !!expRes.genome_assembly_id && VIEWABLE_FORMATS_LOWER.includes(expResFileFormatLower(expRes));

const expResFileFormatToIgvTypeAndFormat = (fileFormat) => {
    const ff = fileFormat.toLowerCase();

    if (ALIGNMENT_FORMATS_LOWER.includes(ff)) return ["alignment", ff];
    if (ANNOTATION_FORMATS_LOWER.includes(ff)) return ["annotation", "bigBed"];  // TODO: expand if we support more
    if (MUTATION_FORMATS_LOWER.includes(ff)) return ["mut", ff];
    if (WIG_FORMATS_LOWER.includes(ff)) return ["wig", "bigWig"];  // TODO: expand if we support wig/bedGraph
    if (VARIANT_FORMATS_LOWER.includes(ff)) return ["variant", "vcf"];

    return [undefined, undefined];
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

const buildIgvTrack = (igvUrls, track) => {
    const [type, format] = expResFileFormatToIgvTypeAndFormat(track.fileFormatLower);
    return {
        type,
        format,
        url: igvUrls[track.filename].url,
        indexURL: igvUrls[track.filename].indexUrl,  // May be undefined if this track is not indexed
        name: track.filename,
        squishedCallHeight: SQUISHED_CALL_HEIGHT,
        expandedCallHeight: EXPANDED_CALL_HEIGHT,
        displayMode: DISPLAY_MODE,
        visibilityWindow: VISIBILITY_WINDOW,
    };
};

const IndividualTracks = ({ individual }) => {
    const { accessToken } = useSelector((state) => state.auth);

    const igvDivRef = useRef();
    const igvBrowserRef = useRef(null);
    const [creatingIgvBrowser, setCreatingIgvBrowser] = useState(false);

    const { igvUrlsByFilename: igvUrls, isFetchingIgvUrls } = useSelector((state) => state.drs);

    // read stored position only on first render
    const igvPosition = useSelector(
        (state) => state.explorer.igvPosition,
        () => true,  // We don't want to re-render anything when the position changes
    );

    const dispatch = useDispatch();

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
            availableGenomes[g.id] = { id: g.id, fastaURL: g.fasta, indexURL: g.fai };
        });
        (igvGenomes.data ?? []).forEach((g) => availableGenomes[g.id] = g);

        console.debug("total available genomes:", availableGenomes);

        return availableGenomes;
    }, [igvGenomes, referenceGenomes]);

    const biosamplesData = useDeduplicatedIndividualBiosamples(individual);
    const viewableResults = useMemo(
        () => {
            const experiments = biosamplesData.flatMap((b) => b?.experiments ?? []);
            const vr = Object.values(
                Object.fromEntries(  // Deduplicate experiment results by file name by building an object
                    experiments.flatMap((e) => e?.experiment_results ?? [])
                        .filter(isViewableInIgv)
                        .map((expRes) => {
                            /** @type string|undefined */
                            const fileFormatLower = expResFileFormatLower(expRes);
                            return [
                                expRes.filename,
                                {
                                    ...expRes,
                                    // by default, don't view alignments (user can turn them on in track controls):
                                    fileFormatLower,
                                    viewInIgv: !ALIGNMENT_FORMATS_LOWER.includes(fileFormatLower),
                                },
                            ];
                        }),
                ),
            ).sort((r1, r2) => (r1.fileFormatLower ?? "").localeCompare(r2.fileFormatLower ?? ""));
            console.debug("Viewable experiment results:", vr);
            return vr;
        },
        [biosamplesData],
    );

    // augmented experiment results with viewInIgv state + cached lowercase / normalized file format:
    const [allTracks, setAllTracks] = useState(viewableResults);

    useEffect(() => {
        // If the set of viewable results changes, reset the track state
        setAllTracks(viewableResults);
    }, [viewableResults]);

    const allFoundFiles = useMemo(
        () => allTracks.filter((t) => !!igvUrls[t.filename]?.url),
        [allTracks, igvUrls],
    );

    const [selectedAssemblyID, setSelectedAssemblyID] = useState(null);

    const trackAssemblyIDs = useMemo(
        () => Array.from(new Set(allFoundFiles.map((t) => t.genome_assembly_id))).sort(),
        [allFoundFiles]);

    useEffect(() => {
        if (Object.keys(availableBrowserGenomes).length) {
            if (trackAssemblyIDs.length && trackAssemblyIDs[0]) {
                const asmID = trackAssemblyIDs[0];  // TODO: first available
                console.debug("auto-selected assembly ID:", asmID);
                setSelectedAssemblyID(asmID);
            } else {
                // Backup: hg38
                setSelectedAssemblyID("hg38");
            }
        }
    }, [availableBrowserGenomes, trackAssemblyIDs]);

    const [modalVisible, setModalVisible] = useState(false);

    const showModal = useCallback(() => setModalVisible(true), []);
    const closeModal = useCallback(() => setModalVisible(false), []);

    const toggleView = useCallback((track) => {
        if (!igvBrowserRef.current) return;

        const wasViewing = track.viewInIgv;
        setAllTracks(allTracks.map((t) => t.filename === track.filename ? ({ ...track, viewInIgv: !wasViewing }) : t));

        if (wasViewing) {
            igvBrowserRef.current.removeTrackByName(track.filename);
        } else {
            igvBrowserRef.current.loadTrack(buildIgvTrack(igvUrls, track)).catch(console.error);
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
        const cleanup = () => {
            if (igvBrowserRef.current) {
                console.debug("removing igv.js browser instance");
                igv.removeBrowser(igvBrowserRef.current);
                igvBrowserRef.current = null;
            }
        };

        if (isFetchingIgvUrls) {
            return cleanup;
        }

        if (!allFoundFiles.length || !hasFreshUrls(allTracks, igvUrls)) {
            console.debug("urls not ready");
            console.debug({ igvUrls });
            console.debug({ tracksValid: hasFreshUrls(allTracks, igvUrls) });
            return cleanup;
        }

        if (!Object.keys(availableBrowserGenomes).length || !selectedAssemblyID) {
            console.debug("no available browser genomes / selected assembly ID yet");
            return cleanup;
        }

        console.debug("igv.createBrowser effect dependencies:",
            [igvUrls, allFoundFiles, availableBrowserGenomes, selectedAssemblyID]);

        if (creatingIgvBrowser || igvBrowserRef.current) {
            console.debug(
                "browser is already being created or exists: creatingIgvBrowser =", creatingIgvBrowser,
                "igvBrowserRef.current =", igvBrowserRef.current);
            return cleanup;
        }

        setCreatingIgvBrowser(true);

        const igvTracks = allFoundFiles
            .filter((t) => t.viewInIgv && t.genome_assembly_id === selectedAssemblyID && igvUrls[t.filename].url)
            .map((t) => buildIgvTrack(igvUrls, t));

        const igvOptions = {
            genome: availableBrowserGenomes[selectedAssemblyID],
            locus: igvPosition,
            tracks: igvTracks,
        };

        console.debug("creating igv.js browser with options:", igvOptions, "; tracks:", igvTracks);

        igv.createBrowser(igvDivRef.current, igvOptions).then((browser) => {
            browser.on(
                "locuschange",
                debounce((referenceFrame) => {
                    storeIgvPosition(referenceFrame);
                }, DEBOUNCE_WAIT),
            );
            igvBrowserRef.current = browser;
            setCreatingIgvBrowser(false);
            console.debug("created igv.js browser instance:", browser);
        }).catch((err) => {
            message.error(`Error creating igv.js browser: ${err}`);
            console.error(err);
        });

        return cleanup;
    }, [igvUrls, allFoundFiles, availableBrowserGenomes, selectedAssemblyID]);

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
            <div ref={igvDivRef} />
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
