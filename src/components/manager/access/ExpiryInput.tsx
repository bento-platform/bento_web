import { useCallback, useEffect, useState } from "react";
import { DatePicker, Radio, Space } from "antd";
import type { RadioChangeEvent } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

export type ExpiryInputProps = {
    value?: string | null;
    onChange?: (value: string | null) => void;
};

const ExpiryInput = ({ value, onChange }: ExpiryInputProps) => {
    const [radio, setRadio] = useState<"none" | "expiry">("none");
    const [date, setDate] = useState<Dayjs | null>(null);

    useEffect(() => {
        setRadio(value === null ? "none" : "expiry");
        if (value !== null) {
            setDate(dayjs(value));
        }
    }, [value]);

    const onRadioChange = useCallback((e: RadioChangeEvent) => {
        const newRadioValue: "none" | "expiry" = e.target.value;
        setRadio(newRadioValue);
        if (onChange) {
            // Controlled mode
            onChange(newRadioValue === "none" ? null : date?.toISOString() ?? null);
        }
    }, [onChange]);

    const onPickerChange = useCallback((d: Dayjs) => {
        setDate(d);
        if (onChange) {
            // Controlled mode
            onChange(d.toISOString())
        }
    }, [onChange]);

    return (
        <Radio.Group value={radio} onChange={onRadioChange}>
            <Space direction="vertical">
                <Radio value="none">None</Radio>
                <Radio value="expiry">
                    <DatePicker showTime={true} disabled={radio === "none"} value={date} onChange={onPickerChange} />
                </Radio>
            </Space>
        </Radio.Group>
    );
};

export default ExpiryInput;
