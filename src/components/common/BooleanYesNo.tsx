import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";

type BooleanYesNoProps = {
  value?: boolean;
};

const BooleanYesNo = ({ value }: BooleanYesNoProps) => {
  if (value) {
    return (
      <span style={{ color: "#52c41a" }}>
        <CheckCircleFilled /> Yes
      </span>
    );
  } else {
    return (
      <span style={{ color: "#f5222d" }}>
        <CloseCircleFilled /> No
      </span>
    );
  }
};

export default BooleanYesNo;
