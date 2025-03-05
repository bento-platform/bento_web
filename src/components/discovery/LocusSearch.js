import { useCallback, useEffect, useRef, useState } from "react";
import { AutoComplete, Input, Tag } from "antd";
import PropTypes from "prop-types";
import { useGeneNameSearch } from "@/modules/reference/hooks";

const NULL_LOCUS = { chrom: null, start: null, end: null };

// Position notation pattern
//  - strip chr prefix, but allow any other types of chromosome - eventually this should instead autocomplete from the
//    reference service.
const POS_NOTATION_PATTERN = /(?:CHR|chr)?([\w.-]+):(\d+)-(\d+)$/;

const parsePosition = (value) => {
  const result = POS_NOTATION_PATTERN.exec(value);

  if (!result) {
    return NULL_LOCUS;
  }

  const chrom = result[1].toUpperCase(); //for eg 'x', has no effect on numbers
  const start = Number(result[2]);
  const end = Number(result[3]);
  return { chrom, start, end };
};

const looksLikePositionNotation = (value) => !value.includes(" ") && value.includes(":");

const LocusSearch = ({
  assemblyId,
  geneSearchEnabled,
  addVariantSearchValues,
  handleLocusChange,
  setLocusValidity,
}) => {
  const mounted = useRef(false);

  const [autoCompleteOptions, setAutoCompleteOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const valueLooksLikePosNot = looksLikePositionNotation(inputValue);

  const showAutoCompleteOptions = geneSearchEnabled && !!inputValue.length && !valueLooksLikePosNot;

  const handlePositionNotation = useCallback(
    (value) => {
      const { chrom, start, end } = parsePosition(value);
      setLocusValidity(chrom && start && end);
      addVariantSearchValues({ chrom, start, end });
    },
    [setLocusValidity, addVariantSearchValues],
  );

  useEffect(() => {
    if (looksLikePositionNotation(inputValue)) {
      handlePositionNotation(inputValue);
      setAutoCompleteOptions([]);
    }
  }, [inputValue, handlePositionNotation, setLocusValidity]);

  const handleChangeInput = useCallback((e) => setInputValue(e.target.value), []);
  const handleChangeAutoComplete = useCallback((value) => setInputValue(value), []);

  // Don't execute search if showAutoCompleteOptions is false (gene search disabled / input doesn't look like search)
  const { data: geneSearchResults } = useGeneNameSearch(assemblyId, showAutoCompleteOptions ? inputValue : null);

  const handleOnBlur = useCallback(() => {
    // custom checking when tabbing away
    // input can be one of three cases:
    // - an autocomplete selection
    // - position notation
    // - incorrect

    // incorrect values are passed as null for handling elsewhere

    const isAutoCompleteOption = inputValue.includes(" ");
    const isPositionNotation = inputValue.includes(":") && !isAutoCompleteOption;

    if (!(isAutoCompleteOption || isPositionNotation)) {
      handleLocusChange(NULL_LOCUS);
      addVariantSearchValues(NULL_LOCUS);
      return;
    }

    if (isPositionNotation) {
      const position = parsePosition(inputValue);
      handleLocusChange(position);
      addVariantSearchValues(position);
    }
  }, [inputValue, handleLocusChange, addVariantSearchValues]);

  const handleSelect = useCallback(
    (value, option) => {
      setInputValue(value);
      const locus = option.locus;

      // may not need error checking here, since this is user selection, not user input
      if (!locus) {
        console.warn("handleSelect: locus was false-y; got option:", option);
        return;
      }

      addVariantSearchValues(locus);
      handleLocusChange(locus);
    },
    [addVariantSearchValues, handleLocusChange],
  );

  useEffect(() => {
    setAutoCompleteOptions(
      (geneSearchResults ?? [])
        .sort((a, b) => (a.feature_name > b.feature_name ? 1 : -1))
        .map((g) => ({
          value: `${g.feature_name} (${g.contig_name}:${g.entries[0].start_pos}-${g.entries[0].end_pos})`,
          label: (
            <>
              {g.feature_name}&nbsp; ({g.contig_name}:{g.entries[0].start_pos}-{g.entries[0].end_pos}
              )&nbsp;
              <Tag>{g.feature_type}</Tag>
            </>
          ),
          locus: {
            chrom: g.contig_name.replace("chr", ""), // Gohan doesn't accept chr# notation
            start: g.entries[0].start_pos,
            end: g.entries[0].end_pos,
          },
        })),
    );
  }, [geneSearchResults]);

  useEffect(() => {
    // If the input mode changes, we need to clear the corresponding Redux state since it isn't directly linked
    //  - if we're making the state newly invalid (rather than on first run), run handleLocusChange() too
    if (mounted.current) handleLocusChange(NULL_LOCUS);
    addVariantSearchValues(NULL_LOCUS);
  }, [addVariantSearchValues, handleLocusChange, geneSearchEnabled]);

  // This effect needs to be last before rendering!
  // A small hack to change the above effect's behaviour if we're making the input invalid (vs. it starting invalid)
  useEffect(() => {
    mounted.current = true;
  }, []);

  if (!geneSearchEnabled) {
    return <Input onChange={handleChangeInput} onBlur={handleOnBlur} />;
  }

  return (
    <AutoComplete
      options={showAutoCompleteOptions ? autoCompleteOptions : []}
      onChange={handleChangeAutoComplete}
      onSelect={handleSelect}
      onBlur={handleOnBlur}
    />
  );
};

LocusSearch.propTypes = {
  assemblyId: PropTypes.string,
  geneSearchEnabled: PropTypes.bool,
  addVariantSearchValues: PropTypes.func,
  handleLocusChange: PropTypes.func,
  setLocusValidity: PropTypes.func,
};

export default LocusSearch;
