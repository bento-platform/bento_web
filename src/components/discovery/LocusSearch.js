import React, {useEffect, useState} from "react";
import { AutoComplete, Form } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { performGohanGeneSearchIfPossible } from "../../modules/discovery/actions";


// TODOs: 
// take assembly as required prop
// style options
// fill form data

const { Option } = AutoComplete;

const LocusSearch = () => {
  const [input, setInput] = useState("");
  const [autoCompleteOptions, setAutoCompleteOptions] = useState([])
  const geneSearchResults = useSelector((state) => state.discovery.geneNameSearchResponse);
  const dispatch = useDispatch();

  const handleChange = (value) => {

    setInput(value)
    if (!value.length){
      return
    }
    dispatch(performGohanGeneSearchIfPossible(value))
  } 

  const handleSelect = (value, option) => {
    console.log(`handleSelect, value: ${value}, option: ${option}`)
  } 
  
  useEffect(() => {
    setAutoCompleteOptions((geneSearchResults ?? []).sort((a, b) => (a.name > b.name) ? 1 : -1))

    console.log({geneSearchResultsFromComponent: geneSearchResults})
  }, [geneSearchResults])

  return <AutoComplete
    options={autoCompleteOptions}
    onChange={handleChange}
    onSelect={handleSelect}
    >
      {autoCompleteOptions.map((r, i) => <Option key={r.name+r.assemblyId} value={r.name+r.assemblyId}>{`${r.name} chromosome: ${r.chrom} start: ${r.start} end: ${r.end}`}</Option>)}
      </AutoComplete>
};

export default LocusSearch;