import type { CSSProperties } from "react";
import { Alert } from "antd";

type DropBoxInformationProps = {
  style?: CSSProperties;
};

const DropBoxInformation = ({ style }: DropBoxInformationProps) => (
  <Alert
    type="info"
    showIcon={true}
    message="About the drop box"
    description={`
        The drop box contains files which are not yet ingested into this Bento instance. They are not
        organized in any particular structure; instead, this serves as a place for incoming data files to be
        deposited and examined.
    `}
    style={style}
  />
);

export default DropBoxInformation;
