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

// const GeneDropdownOption = ({gene}) => {

//   const {assemblyId, name, chrom, start, end} = gene;
//   console.log({assemblyId: assemblyId, name: name, chrom: chrom, start: start, end: end})

//   return <p>{gene.name}</p>
// }

const geneOptionText = (gene) => {
  const {assemblyId, name, chrom, start, end} = gene;
  return `${gene.name} chromosome: ${gene.chrom} start: ${gene.start} end: ${gene.end}`
}


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

      // also stop showing dropdown

      return
    }

    dispatch(performGohanGeneSearchIfPossible(value, assemblyId))
  } 

  const handleSelect = (value, options) => {
    const locus = options.props?.locus
    
    // todo: "locus" may be array of multiple items if users tabs away 
    console.log({selectValue: value, selectOptions: options})

    // may not need error checking here, since this is user selection, not user input
    if (!locus){
      return
    }

    addVariantSearchValues({...locus})
  } 

  useEffect(() => {
    setAutoCompleteOptions((geneSearchResults ?? []).sort((a, b) => (a.name > b.name) ? 1 : -1))
  }, [geneSearchResults])

  console.log({autoCompleteOptions: autoCompleteOptions})
  
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
          >{geneOptionText(g)}</Option>
        ))}
    </AutoComplete>
  );
};

export default LocusSearch;

function parsePosition(value) {

  // todo
  // parse "chr:start-end" notation and call setVariantSearchValues()
}