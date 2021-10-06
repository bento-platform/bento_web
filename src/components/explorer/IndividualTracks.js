import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { individualPropTypesShape } from "../../propTypes";
import { getIgvUrlsFromDrs } from "../../modules/drs/actions";
import igv from "igv";

const IndividualTracks = ({ individual }) => {
    const igvRef = useRef(null);
    const igvRendered = useRef(false);
    const igvUrls = useSelector((state) => state.drs.igvUrlsByFilename);
    const isFetchingIgvUrls = useSelector((state) => state.drs.isFetchingIgvUrls);
    const dispatch = useDispatch();

    const biosamplesData = (individual?.phenopackets ?? []).flatMap((p) => p.biosamples);
    const experimentsData = biosamplesData.flatMap((b) => b?.experiments ?? []);
    let viewableResults = experimentsData.flatMap((e) => e?.experiment_results ?? []).filter(isViewable);
    viewableResults = viewableResults.map(v => {return {...v, viewInIgv: "true"}})
    const tracks = viewableResults.map((r) => r.filename);
    let igvTracks, igvOptions;

  // hardcode for hg19/GRCh37, fix requires updates elsewhere in Bento
    const genome = "hg19";

  // verify all tracks have a url (may have stale urls from previous request)
    const hasUrlsForAllFiles = (filenames, urls) => filenames.every(f => urls.hasOwnProperty(f));

  // retrieve urls on mount
    useEffect(() => {
        if (tracks.length) {

      // don't search if all urls already known
            if (hasUrlsForAllFiles(tracks, igvUrls)) {
                return;
            }

            dispatch(getIgvUrlsFromDrs(tracks));
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

        if (!tracks.length || !hasUrlsForAllFiles(tracks, igvUrls) || igvRendered.current) {
            console.log("urls not ready");
            console.log({ igvUrls: igvUrls });
            console.log({ tracksValid: hasUrlsForAllFiles(tracks, igvUrls) });
            console.log({ igvRendered: igvRendered.current });
            return;
        }

        console.log("rendering igv");

    // TODO: tracks config for unindexed files

        igvTracks = tracks.map((t) => ({
            type: "variant",
            format: "vcf",
            url: igvUrls[t].dataUrl,
            indexURL: igvUrls[t].indexUrl,
            name: t,
            squishedCallHeight: 10,
            expandedCallHeight: 50,
            displayMode: "expanded",
            visibilityWindow: 60000000,
        }));

        igvOptions = {
            genome: genome,
            tracks: igvTracks,
        };

        igv.createBrowser(igvRef.current, igvOptions).then(function (browser) {
            igv.browser = browser;
            igvRendered.current = true;
        });
    }, [igvUrls]);

    return <>{<div ref={igvRef} />}</>;
};

IndividualTracks.propTypes = {
    individual: individualPropTypesShape,
};

// expand here to include more file types
function isViewable(file) {
    return file.file_format?.toLowerCase() === "vcf" || file.filename?.toLowerCase().includes(".vcf");
}

export default IndividualTracks;
