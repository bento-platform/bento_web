import React, {useEffect, useState} from "react";
import { AutoComplete } from "antd";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { performGohanGeneSearchIfPossible } from "../../modules/discovery/actions";

// TODOs:
// style options

const { Option } = AutoComplete;

const geneDropdownText = (g) => {
    return `${g.name} chromosome: ${g.chrom} start: ${g.start} end: ${g.end}`;
};

const LocusSearch = ({assemblyId, addVariantSearchValues, handleLocusChange, setLocusValidity}) => {
    const [autoCompleteOptions, setAutoCompleteOptions] = useState([]);
    const geneSearchResults = useSelector((state) => state.discovery.geneNameSearchResponse);
    const [inputValue, setInputValue] = useState("");
    const dispatch = useDispatch();

    const showAutoCompleteOptions = assemblyId === "GRCh37" || assemblyId === "GRCh38";

    const parsePosition = (value) => {
        const parse = /(?:CHR|chr)([0-9]{1,2}|X|x|Y|y|M|m):(\d+)-(\d+)/;
        const result = parse.exec(value);

        if (!result) {
            setLocusValidity(false);
            return {chrom: null, start: null, end: null};
        }

        const chrom = result[1].toUpperCase(); //for eg 'x', has no effect on numbers
        const start = Number(result[2]);
        const end = Number(result[3]);

        return {chrom, start, end};
    };

    const handlePositionNotation = (value) => {
        const {chrom, start, end} = parsePosition(value);
        setLocusValidity(chrom && start && end);
        addVariantSearchValues({chrom, start, end});
    };

    const handleChange = (value) => {

        setInputValue(value);

        if (value.includes(":")) {
            handlePositionNotation(value);

            // let user finish typing position before showing error
            setLocusValidity(true);

            setAutoCompleteOptions([]);
            return;
        }

        if (!value.length || !showAutoCompleteOptions) {
            return;
        }

        dispatch(performGohanGeneSearchIfPossible(value, assemblyId));
    };

    const handleOnBlur = () => {
        // antd has no "select on tab" option
        // so when tabbing away, handle the current contents of the input
        // input can be one of three cases:
        // - an autocomplete selection
        // - position notation
        // - incorrect

        // incorrect values are passed as null for handling elsewhere

        const isAutoCompleteOption = inputValue.endsWith("_autocomplete_option");
        const isPositionNotation = inputValue.includes(":");

        if (!(isAutoCompleteOption || isPositionNotation)) {
            handleLocusChange({chrom: null, start: null, end: null});
            addVariantSearchValues({chrom: null, start: null, end: null});
            return;
        }

        if (isPositionNotation) {
            const {chrom, start, end} = parsePosition(inputValue);
            handleLocusChange({chrom, start, end});
            addVariantSearchValues({chrom, start, end});
        }
    };

    const handleSelect = (value, options) => {
        setInputValue(value);
        const locus = options.props?.locus;

    // may not need error checking here, since this is user selection, not user input
        if (!locus) {
            return;
        }

        const {chrom, start, end} = locus;
        addVariantSearchValues({chrom, start, end});
        handleLocusChange(locus);
    };

    useEffect(() => {
        setAutoCompleteOptions((geneSearchResults ?? []).sort((a, b) => (a.name > b.name) ? 1 : -1));
    }, [geneSearchResults]);

    return (
    <AutoComplete
      options={autoCompleteOptions}
      onChange={handleChange}
      onSelect={handleSelect}
      onBlur={handleOnBlur}
      // dropdownMenuStyle={}
      // backfill={true}
    >
      {showAutoCompleteOptions &&
        autoCompleteOptions.map((g) => (
          <Option
            key={`${g.name}_${g.assemblyId}`}

            //add suffix to selection text to distinguish from user text, this text is not shown
            value={`${g.name}_${g.assemblyId}_autocomplete_option`}

            label={`${g.name} chrom: ${g.chrom}`}
            locus={g}
            // style={optionStyle}
          >{geneDropdownText(g)}</Option>
        ))}
    </AutoComplete>
    );
};

LocusSearch.propTypes = {
    assemblyId: PropTypes.string,
    addVariantSearchValues: PropTypes.func,
    handleLocusChange: PropTypes.func,
    setLocusValidity: PropTypes.func
};


export default LocusSearch;
