import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Spin, Tag, TreeSelect} from "antd";

import {nop} from "../../utils/misc";

class TableTreeSelect extends Component {
    static getDerivedStateFromProps(nextProps) {
        if ("value" in nextProps) {
            return {selected: nextProps.value || undefined};
        }
        return null;
    }

    constructor(props) {
        super(props);
        this.state = {selected: props.value || undefined};
    }

    onChange(selected) {
        // Set the state directly unless value is bound
        if (!("value" in this.props)) this.setState({selected});

        // Update the change handler bound to the component
        if (this.props.onChange) this.props.onChange(this.state.selected);
    }

    render() {
        // TODO: Handle table loading better

        const getTableName = (serviceID, tableID) =>
            this.props.tablesByServiceID[serviceID]?.tablesByID?.[tableID]?.name;

        const dataType = this.props.dataType ?? null;

        const selectTreeData = this.props.projects.map(p => ({
            title: p.title,
            selectable: false,
            key: `project:${p.identifier}`,
            value: `project:${p.identifier}`,
            data: p,
            children: p.datasets.map(d => ({
                title: d.title,
                selectable: false,
                key: `dataset:${d.identifier}`,
                value: `dataset:${d.identifier}`,
                data: d,
                children: (this.props.projectTables[p.identifier] ?? [])
                    .filter(t => t.dataset === d.identifier &&
                        ((this.props.tablesByServiceID?.[t.service_id]?.tablesByID ?? {})
                            .hasOwnProperty(t.table_id)))
                    .map(t => ({
                        ...t,
                        tableName: getTableName(t.service_id, t.table_id) ?? "",
                        dataType: this.props.tablesByServiceID[t.service_id].tablesByID[t.table_id].data_type,
                    }))
                    .map(t => ({
                        title: <>
                            <Tag style={{marginRight: "1em"}}>{t.dataType}</Tag>
                            {t.tableName}&nbsp;
                            (<span style={{fontFamily: "monospace"}}>{t.table_id}</span>)
                        </>,
                        disabled: !(dataType === null || dataType === t.dataType),
                        isLeaf: true,
                        key: `${p.identifier}:${t.dataType}:${t.table_id}`,
                        value: `${p.identifier}:${t.dataType}:${t.table_id}`,
                        data: t,
                    })),
            }))
        }));

        return <Spin spinning={this.props.servicesLoading || this.props.projectsLoading}>
            <TreeSelect style={this.props.style ?? {}}
                        showSearch={true}
                        filterTreeNode={(v, n) => {
                            const filter = v.toLocaleLowerCase().trim();
                            if (filter === "") return true;
                            return n.key.toLocaleLowerCase().includes(filter)
                                || n.props.data.title.toLocaleLowerCase().includes(filter)
                                || (n.props.data.dataType || "").toLocaleLowerCase().includes(filter);
                        }}
                        onChange={this.props.onChange ?? nop}
                        value={this.state.selected}
                        treeData={selectTreeData}
                        treeDefaultExpandAll={true} />
        </Spin>;
    }
}

TableTreeSelect.propTypes = {
    style: PropTypes.object,

    value: PropTypes.string,

    dataType: PropTypes.string,
    onChange: PropTypes.func,

    projects: PropTypes.array,
    projectTables: PropTypes.object,  // TODO: Shape
    tablesByServiceID: PropTypes.objectOf(PropTypes.object),  // TODO: Shape

    servicesLoading: PropTypes.bool,
    projectsLoading: PropTypes.bool,
};

const mapStateToProps = state => ({
    projects: state.projects.items,
    projectTables: state.projectTables.itemsByProjectID,
    tablesByServiceID: state.serviceTables.itemsByServiceID,
    servicesLoading: state.services.isFetchingAll,
    projectsLoading: state.projects.isFetching,
});

export default connect(mapStateToProps)(TableTreeSelect);
