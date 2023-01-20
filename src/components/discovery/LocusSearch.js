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
    const [currentLocus, setCurrentLocus] = useState(
        {chrom: null, start: null, end: null}); //needed for onBlur checking
    const dispatch = useDispatch();

    const showAutoCompleteOptions = assemblyId === "GRCh37" || assemblyId === "GRCh38";

    const parsePosition = (value) => {
        const parse = /(?:CHR|chr)([0-9]{1,2}|X|x|Y|y|M|m):(\d+)-(\d+)/;
        const result = parse.exec(value);

        if (!result) {
            setCurrentLocus({chrom: null, start: null, end: null});
            setLocusValidity(false);
            return;
        }

        const chrom = result[1].toUpperCase(); //for eg 'x', has no effect on numbers
        const start = Number(result[2]);
        const end = Number(result[3]);

        setCurrentLocus({chrom: chrom, start: start, end: end});
        addVariantSearchValues({chrom: chrom, start: start, end: end});
    };

    const handleChange = (value) => {

    // handle position notation
        if (value.includes(":")) {
            parsePosition(value);

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
        // so check if there's a valid locus when tabbing away
        handleLocusChange(currentLocus);
    };

    const handleSelect = (value, options) => {
        const locus = options.props?.locus;

    // may not need error checking here, since this is user selection, not user input
        if (!locus) {
            return;
        }

        const {chrom, start, end} = locus;
        addVariantSearchValues({chrom: chrom, start: start, end: end});
        setCurrentLocus({chrom: chrom, start: start, end: end});
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
            value={g.name}
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
