import React, {useEffect, useState} from "react";
import { AutoComplete, Form } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { performGohanGeneSearchIfPossible } from "../../modules/discovery/actions";


// TODOs: 
// style options
// tabbing away should select ?


const { Option } = AutoComplete;

const LocusSearch = ({assemblyId, addVariantSearchValues}) => {
  // const [input, setInput] = useState(""); //needed?
  const [autoCompleteOptions, setAutoCompleteOptions] = useState([])
  const geneSearchResults = useSelector((state) => state.discovery.geneNameSearchResponse);
  const dispatch = useDispatch();

  const showAutoCompleteOptions = assemblyId==="GRCh37" || assemblyId==="GRCh38"

  const handleChange = (value) => {

    // setInput(value)
    if (!value.length || !showAutoCompleteOptions){
      return
    }

    // handle position notation
    if(value.includes(':')){
      parsePosition(value)
      return
    }

    dispatch(performGohanGeneSearchIfPossible(value, assemblyId))
  } 

  const handleSelect = (value, options) => {
    const locus = options.props?.locus
    
    // todo: "locus" may be array of multiple items if users tabs away 

    // may not need error checking here, since this is user selection, not user input
    if (!locus){
      return
    }
    addVariantSearchValues({...locus})
  } 

  useEffect(() => {
    setAutoCompleteOptions((geneSearchResults ?? []).sort((a, b) => (a.name > b.name) ? 1 : -1))
  }, [geneSearchResults])

  return <AutoComplete
    options={autoCompleteOptions}
    onChange={handleChange}
    onSelect={handleSelect}
    >
      {showAutoCompleteOptions && autoCompleteOptions.map((r, i) => <Option key={r.name} value={r.name} locus={r} >{`${r.name} chromosome: ${r.chrom} start: ${r.start} end: ${r.end}`}</Option>)}
      </AutoComplete>
};

export default LocusSearch;

function parsePosition(value) {

  // todo
  // parse "chr:start-end" notation and call setVariantSearchValues()
}