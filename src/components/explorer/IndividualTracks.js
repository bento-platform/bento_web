import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { individualPropTypesShape } from "../../propTypes";
import { retrieveDrsUrlsForVcf } from "../../modules/drs/actions";
import igv from "igv";

const IndividualTracks = ({ individual }) => {
    const igvRef = useRef(null);
    const igvRendered = useRef(false);
    const drsUrls = useSelector((state) => state.drs.vcfUrlsByFilename);
    const hasSetVcfUrls = useSelector((state) => state.drs.hasSetVcfUrls);
    const dispatch = useDispatch();

    const biosamplesData = (individual?.phenopackets ?? []).flatMap((p) => p.biosamples);
    const experimentsData = biosamplesData.flatMap((b) => b?.experiments ?? []);
    const viewableResults = experimentsData.flatMap((e) => e?.experiment_results ?? []).filter(isViewable);
    const allTracks = viewableResults.map((r) => r.filename);
    let igvTracks, igvOptions;

  // hardcode for hg19/GRCh37, fix requires updates elsewhere in Bento
    const genome = "hg19";

  // track valid if it has urls
    const trackValid = (t) => drsUrls.hasOwnProperty(t);

    // temp, strip all but first vcf
    const tracks = allTracks.slice(0,1);

  // retrieve urls on mount
    useEffect(() => {
    // temp: assume at most one vcf
    // todo: change dispatch to handle array of tracks
        if (tracks[0]) {
            dispatch(retrieveDrsUrlsForVcf(tracks[0]));
        }
    }, []);

  // render igv when track urls ready
    useEffect(() => {
        if (!hasSetVcfUrls) {
            console.log("useEffect: vcfs not ready");
            return;
        } else {
            console.log("useEffect: vcfs ready");
        }

        if (!tracks.length || !tracks.every(trackValid) || igvRendered.current) {
            console.log("vcf urls not ready");
            console.log({ drsUrls: drsUrls });
            console.log({ tracksValid: tracks.every(trackValid) });
            console.log({igvRendered: igvRendered.current});
            return;
        }

        console.log("rendering igv");

        igvTracks = tracks.map((t) => ({
            type: "variant",
            format: "vcf",
            url: drsUrls[t].dataUrl,
            indexURL: drsUrls[t].indexUrl,
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

        igv.createBrowser(igvRef.current, igvOptions).
            then(function (browser) {
                igv.browser = browser;
                igvRendered.current = true;
            });

    }, [hasSetVcfUrls]);

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
