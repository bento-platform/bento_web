import { useCallback, useEffect, useState } from "react";
import { DatePicker, Radio, type RadioChangeEvent, Space } from "antd";
import dayjs, { type Dayjs } from "dayjs";

export type ExpiryInputProps = {
    value?: string | null;
    onChange?: (value: string | null) => void;
};

type ExpiryType = "none" | "timestamp";
const EXPIRY_TYPE_NONE = "none";
const EXPIRY_TYPE_TIMESTAMP = "timestamp";

const ExpiryInput = ({ value, onChange }: ExpiryInputProps) => {
    const [expiryType, setExpiryType] = useState<ExpiryType>(EXPIRY_TYPE_NONE);
    const [date, setDate] = useState<Dayjs | null>(null);

    useEffect(() => {
        // if value is undefined, component is "uncontrolled" and we rely on local state only:
        if (value === undefined) return;

        // otherwise, component is "controlled" and we use the property to update the local state:
        setExpiryType(value === null ? EXPIRY_TYPE_NONE : EXPIRY_TYPE_TIMESTAMP);
        if (value !== null) {
            setDate(dayjs(value));
        }
    }, [value]);

    const onRadioChange = useCallback((e: RadioChangeEvent) => {
        const newRadioValue: ExpiryType = e.target.value;
        setExpiryType(newRadioValue);
        if (onChange) {
            // Controlled mode
            onChange(newRadioValue === EXPIRY_TYPE_NONE ? null : date?.toISOString() ?? null);
        }
    }, [date, onChange]);

    const onPickerChange = useCallback((d: Dayjs) => {
        setDate(d);
        if (onChange) {
            // Controlled mode
            onChange(d.toISOString());
        }
    }, [onChange]);

    return (
        <Radio.Group value={expiryType} onChange={onRadioChange}>
            <Space direction="vertical">
                <Radio value={EXPIRY_TYPE_NONE}>None</Radio>
                <Radio value={EXPIRY_TYPE_TIMESTAMP}>
                    <DatePicker
                        showTime={true}
                        disabled={expiryType === EXPIRY_TYPE_NONE}
                        value={date}
                        onChange={onPickerChange}
                    />
                </Radio>
            </Space>
        </Radio.Group>
    );
};

export default ExpiryInput;
