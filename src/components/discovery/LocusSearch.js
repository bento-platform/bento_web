import React, {useEffect, useState} from "react";
import { AutoComplete, Form } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { performGohanGeneSearchIfPossible } from "../../modules/discovery/actions";


// TODOs: 
// style options
// tabbing away should select ?
// stop showing options on position notation

const { Option } = AutoComplete;

const optionStyle = {
  backgroundColor: "hotpink"
}

const geneDropdownText = (g) => {
  return `${g.name} chromosome: ${g.chrom} start: ${g.start} end: ${g.end}`
}

const LocusSearch = ({assemblyId, addVariantSearchValues}) => {
  const [input, setInput] = useState(""); 
  const [autoCompleteOptions, setAutoCompleteOptions] = useState([])
  const geneSearchResults = useSelector((state) => state.discovery.geneNameSearchResponse);
  const dispatch = useDispatch();

  const showAutoCompleteOptions = assemblyId==="GRCh37" || assemblyId==="GRCh38"

  const handleChange = (value) => {

    console.log(`got input ${value}`)
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

    // todo: "locus" may be array of multiple items if users tabs away 
    console.log({selectValue: value, selectOptions: options})

    const locus = options.props?.locus
    
    // may not need error checking here, since this is user selection, not user input
    if (!locus){
      return
    }

    addVariantSearchValues({...locus})
  } 

  const handleSearch = (value) => {
    console.log(`handleSearch: ${value}`)
  }


  useEffect(() => {
    setAutoCompleteOptions((geneSearchResults ?? []).sort((a, b) => (a.name > b.name) ? 1 : -1))
  }, [geneSearchResults])
  
  return (
    <AutoComplete
      options={autoCompleteOptions}
      onChange={handleChange}
      onSelect={handleSelect}
      onSearch={handleSearch}

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

function parsePosition(value) {

  // todo
  // parse "chr:start-end" notation and call setVariantSearchValues()


  const parse = /(?:CHR|chr)([0-9]{1,2}|X|x|Y|y|M|m):(\d+)-(\d+)/

  const result = parse.exec(value)


  // quit if null

  const chrom = result[1]
  const start = result[2]
  const end = result[3]

  // do some basic error checking before adding



  addVariantSearchValues({chrom: chrom, start: start, end: end})


  
}