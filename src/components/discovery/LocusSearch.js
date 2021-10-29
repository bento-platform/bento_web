import React, {useEffect, useState} from "react";
import { AutoComplete, Form } from "antd";
import { useDispatch, useSelector } from "react-redux";
const { Option } = AutoComplete;

// change to Form.item



const LocusSearch = () => {
  const [input, setInput] = useState("");
  // const geneSearchResults = useSelector((state) => state...... );
  const dispatch = useDispatch();

  const handleSearch = (value) => {
    setInput(value)
    // dispatch search
    console.log(`handleSearch value: ${value}`)
  } 

  const handleSelect = (value, option) => {
    console.log(`handleSelect, value: ${value}, option: ${option}`)
  } 
  
  // useEffect(() => {

  // }, [geneSearchResults])

  return <AutoComplete
    // options={geneSearchResults}
    onSearch={handleSearch}
    onSelect={handleSelect}
    />
};



export default LocusSearch;
