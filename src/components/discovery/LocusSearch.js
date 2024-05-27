import React, { useEffect, useState } from "react";
import { AutoComplete, Tag } from "antd";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { performReferenceGeneSearchIfPossible } from "@/modules/discovery/actions";
import { useReferenceGenomes } from "@/modules/reference/hooks";

// TODOs:
// style options

const parsePosition = (value) => {
    const parse = /(?:CHR|chr)([0-9]{1,2}|X|x|Y|y|M|m):(\d+)-(\d+)/;
    const result = parse.exec(value);

    if (!result) {
        return { chrom: null, start: null, end: null };
    }

    const chrom = result[1].toUpperCase(); //for eg 'x', has no effect on numbers
    const start = Number(result[2]);
    const end = Number(result[3]);
    return { chrom, start, end };
};


const LocusSearch = ({ assemblyId, addVariantSearchValues, handleLocusChange, setLocusValidity }) => {
    const dispatch = useDispatch();

    const referenceGenomes = useReferenceGenomes();
    const [autoCompleteOptions, setAutoCompleteOptions] = useState([]);
    const geneSearchResults = useSelector((state) => state.discovery.geneNameSearchResponse);
    const [inputValue, setInputValue] = useState("");

    const showAutoCompleteOptions = !!referenceGenomes.itemsByID[assemblyId]?.gff3_gz;

    const handlePositionNotation = (value) => {
        const { chrom, start, end } = parsePosition(value);
        setLocusValidity(chrom && start && end);
        addVariantSearchValues({ chrom, start, end });
    };

    const handleChange = (value) => {

        setInputValue(value);

        if (!value.includes(" ") && value.includes(":")) {
            handlePositionNotation(value);

            // let user finish typing position before showing error
            setLocusValidity(true);

            setAutoCompleteOptions([]);
            return;
        }

        if (!value.length || !showAutoCompleteOptions) {
            return;
        }

        dispatch(performReferenceGeneSearchIfPossible(value, assemblyId));
    };

    const handleOnBlur = () => {
        // antd has no "select on tab" option
        // so when tabbing away, handle the current contents of the input
        // input can be one of three cases:
        // - an autocomplete selection
        // - position notation
        // - incorrect

        // incorrect values are passed as null for handling elsewhere

        const isAutoCompleteOption = inputValue.includes(" ");
        const isPositionNotation = inputValue.includes(":") && !isAutoCompleteOption;

        if (!(isAutoCompleteOption || isPositionNotation)) {
            handleLocusChange({ chrom: null, start: null, end: null });
            addVariantSearchValues({ chrom: null, start: null, end: null });
            return;
        }

        if (isPositionNotation) {
            const position = parsePosition(inputValue);
            handleLocusChange(position);
            addVariantSearchValues(position);
        }
    };

    const handleSelect = (value, option) => {
        setInputValue(value);
        const locus = option.locus;

        // may not need error checking here, since this is user selection, not user input
        if (!locus) {
            console.warn("handleSelect: locus was false-y; got option:", option);
            return;
        }

        addVariantSearchValues(locus);
        handleLocusChange(locus);
    };

    useEffect(() => {
        setAutoCompleteOptions(
            (geneSearchResults ?? [])
                .sort((a, b) => (a.feature_name > b.feature_name) ? 1 : -1)
                .map((g) => ({
                    value: `${g.feature_name} (${g.contig_name}:${g.entries[0].start_pos}-${g.entries[0].end_pos})`,
                    label: (
                        <>
                            {g.feature_name}&nbsp;
                            ({g.contig_name}:{g.entries[0].start_pos}-{g.entries[0].end_pos})&nbsp;
                            <Tag>{g.feature_type}</Tag>
                        </>
                    ),
                    locus: {
                        "chrom": g.contig_name.replace("chr", ""),  // Gohan doesn't accept chr# notation
                        "start": g.entries[0].start_pos,
                        "end": g.entries[0].end_pos,
                    },
                })),
        );
    }, [geneSearchResults]);

    return (
        <AutoComplete
            options={showAutoCompleteOptions ? autoCompleteOptions : []}
            onChange={handleChange}
            onSelect={handleSelect}
            onBlur={handleOnBlur}
        />
    );
};

LocusSearch.propTypes = {
    assemblyId: PropTypes.string,
    addVariantSearchValues: PropTypes.func,
    handleLocusChange: PropTypes.func,
    setLocusValidity: PropTypes.func,
};


export default LocusSearch;
