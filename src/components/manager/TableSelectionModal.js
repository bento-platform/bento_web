import React, { useState } from "react";
import PropTypes from "prop-types";

import { Form, Modal } from "antd";

import TableTreeSelect from "./TableTreeSelect";

import { nop } from "../../utils/misc";

const TableSelectionModal = ({ dataType, title, visible, onCancel, onOk }) => {
    const [selected, setSelected] = useState(undefined);

    return (
        <Modal
            title={title || "Select a Table"}
            visible={visible || false}
            onCancel={() => (onCancel || nop)()}
            onOk={() => (onOk || nop)(selected)}
        >
            <Form>
                <Form.Item label="Table">
                    <TableTreeSelect
                        style={{ width: "100%" }}
                        value={selected}
                        dataType={dataType || null}
                        onChange={(table) => setSelected(table)}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

TableSelectionModal.propTypes = {
    dataType: PropTypes.string,
    title: PropTypes.string,
    visible: PropTypes.bool,
    onCancel: PropTypes.func,
    onOk: PropTypes.func,
};

export default TableSelectionModal;

// import React, {Component} from "react";
// import PropTypes from "prop-types";

// import {Form, Modal} from "antd";

// import TableTreeSelect from "./TableTreeSelect";

// import {nop} from "../../utils/misc";

// class TableSelectionModal extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {selected: undefined};
//     }

//     render() {
//         return <Modal title={this.props.title || "Select a Table"}
//                       visible={this.props.visible || false}
//                       onCancel={() => (this.props.onCancel || nop)()}
//                       onOk={() => (this.props.onOk || nop)(this.state.selected)}>
//             <Form>
//                 <Form.Item label="Table">
//                     <TableTreeSelect style={{width: "100%"}}
//                                      value={this.state.selected}
//                                      dataType={this.props.dataType || null}
//                                      onChange={table => this.setState({selected: table})} />
//                 </Form.Item>
//             </Form>
//         </Modal>;
//     }
// }

// TableSelectionModal.propTypes = {
//     dataType: PropTypes.string,
//     title: PropTypes.string,
//     visible: PropTypes.bool,
//     onCancel: PropTypes.func,
//     onOk: PropTypes.func,
// };

// export default TableSelectionModal;
