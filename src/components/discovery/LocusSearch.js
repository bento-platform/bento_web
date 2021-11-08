import React, {useEffect, useState} from "react";
import { AutoComplete } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { performGohanGeneSearchIfPossible } from "../../modules/discovery/actions";

// TODOs: 
// style options

const { Option } = AutoComplete;

const geneDropdownText = (g) => {
  return `${g.name} chromosome: ${g.chrom} start: ${g.start} end: ${g.end}`
}

const LocusSearch = ({assemblyId, addVariantSearchValues}) => {
  const [input, setInput] = useState(""); 
  const [autoCompleteOptions, setAutoCompleteOptions] = useState([])
  const geneSearchResults = useSelector((state) => state.discovery.geneNameSearchResponse);
  const dispatch = useDispatch();

  const showAutoCompleteOptions = assemblyId==="GRCh37" || assemblyId==="GRCh38"

  const parsePosition = (value) => {
    const parse = /(?:CHR|chr)([0-9]{1,2}|X|x|Y|y|M|m):(\d+)-(\d+)/
    const result = parse.exec(value)
  
    if (!result){
      return
    }
    
    let chrom = result[1].toUpperCase() //for eg 'x', has no effect on numbers
    const start = Number(result[2])
    const end = Number(result[3])
    
    addVariantSearchValues({chrom: chrom, start: start, end: end})
  }

  const handleChange = (value) => {

    setInput(value)

    // handle position notation
    if(value.includes(':')){
      parsePosition(value)
      setAutoCompleteOptions([])
      return
    }

    if (!value.length || !showAutoCompleteOptions){
      return
    }

    dispatch(performGohanGeneSearchIfPossible(value, assemblyId))
  } 

  const handleSelect = (value, options) => {
    const locus = options.props?.locus
    
    // may not need error checking here, since this is user selection, not user input
    if (!locus){
      return
    }

    // don't use locus.assemblyId, since this is the lookup value 
    const {chrom, start, end} = locus
    addVariantSearchValues({chrom: chrom, start: start, end: end})
  } 

  useEffect(() => {
    setAutoCompleteOptions((geneSearchResults ?? []).sort((a, b) => (a.name > b.name) ? 1 : -1))
  }, [geneSearchResults])
  
  return (
    <AutoComplete
      options={autoCompleteOptions}
      onChange={handleChange}
      onSelect={handleSelect}
      // dropdownMenuStyle={}
      // backfill={true}
    >
      {showAutoCompleteOptions &&
        autoCompleteOptions.map((g, i) => (
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

export default LocusSearch;
