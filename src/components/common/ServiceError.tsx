import { Result } from "antd";

type ServiceErrorProps = {
  service: string;
};

const ServiceError = ({ service }: ServiceErrorProps) => (
  <Result
    status="error"
    title={`Could not contact the ${service} service`}
    subTitle="Please contact the Bento node administrator."
  />
);

export default ServiceError;
