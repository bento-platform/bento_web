import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import { Spin, TreeSelect } from "antd";
import { useProjects } from "@/modules/metadata/hooks";

export const ID_FORMAT_PROJECT_DATASET = "project:dataset";
export const ID_FORMAT_DATASET = "dataset";

const DatasetTreeSelect = forwardRef(({ value, onChange, style, idFormat = ID_FORMAT_PROJECT_DATASET }, ref) => {
  const { items: projectItems, isFetching: projectsFetching } = useProjects();
  const servicesFetching = useSelector((state) => state.services.isFetchingAll);

  const [selected, setSelected] = useState(value ?? undefined);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  const onChangeInner = useCallback(
    (newSelected) => {
      if (!value) setSelected(newSelected);
      if (onChange) {
        onChange(newSelected);
      }
    },
    [value, onChange],
  );

  const selectTreeData = useMemo(
    () =>
      projectItems.map((p) => ({
        title: p.title,
        selectable: false,
        key: p.identifier,
        value: p.identifier,
        children: p.datasets.map((d) => {
          const key = idFormat === ID_FORMAT_PROJECT_DATASET ? `${p.identifier}:${d.identifier}` : d.identifier;
          return {
            title: d.title,
            key,
            value: key,
          };
        }),
      })),
    [idFormat, projectItems],
  );

  return (
    <Spin spinning={servicesFetching || projectsFetching}>
      <TreeSelect
        ref={ref}
        style={style ?? {}}
        showSearch={true}
        onChange={onChangeInner}
        value={selected}
        treeData={selectTreeData}
        treeDefaultExpandAll={true}
      />
    </Spin>
  );
});

DatasetTreeSelect.propTypes = {
  style: PropTypes.object,
  value: PropTypes.string,
  onChange: PropTypes.func,
  idFormat: PropTypes.oneOf([ID_FORMAT_PROJECT_DATASET, ID_FORMAT_DATASET]),
};

export default DatasetTreeSelect;
