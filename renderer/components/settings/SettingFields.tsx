'use client';
import React, { useEffect, useState } from 'react';
import {
  Calendar,
  DateField,
  DatePicker,
  Input,
  Label,
  ListBox,
  Select,
  Slider,
  Switch,
  TimeField,
} from '@heroui/react';
import { parseDate, parseTime } from '@internationalized/date';
import { getConfigSync, setConfigSync } from '@renderer/features/ipc/config';

export type SettingOption = {
  value: string;
  label: string;
};

type BaseConfigProps<T> = {
  configName?: string;
  onLoaded?: (value: T) => void;
};

function normalizeToIsoDate(value: string): string {
  const raw = value.trim();
  if (!raw) return '';
  const normalized = raw.replace(/\//g, '-');
  const parts = normalized.split('-').filter(Boolean);
  if (parts.length !== 3) return '';
  const [y, m, d] = parts;
  if (!/^\d{4}$/.test(y) || !/^\d{1,2}$/.test(m) || !/^\d{1,2}$/.test(d)) return '';
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

export function SettingSwitch({
  checked,
  onChange,
  isDisabled = false,
  configName,
  onLoaded,
}: {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  isDisabled?: boolean;
} & BaseConfigProps<boolean>) {
  const [innerValue, setInnerValue] = useState(false);
  const value = checked ?? innerValue;

  useEffect(() => {
    if (!configName) return;
    (async () => {
      const raw = await getConfigSync(configName);
      if (typeof raw === 'boolean') {
        setInnerValue(raw);
        onLoaded?.(raw);
      }
    })();
  }, [checked, configName, onLoaded]);

  const handleChange = (next: boolean) => {
    if (checked === undefined) {
      setInnerValue(next);
    }
    onChange?.(next);
    if (configName) {
      setConfigSync(configName, next);
    }
  };

  return (
    <Switch isSelected={value} isDisabled={isDisabled} onChange={() => handleChange(!value)}>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
    </Switch>
  );
}

export function SettingSlider({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  widthClassName = 'w-80',
  configName,
  onLoaded,
}: {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  widthClassName?: string;
} & BaseConfigProps<number>) {
  const [innerValue, setInnerValue] = useState(min);
  const currentValue = value ?? innerValue;

  useEffect(() => {
    if (!configName) return;
    (async () => {
      const raw = await getConfigSync(configName);
      const parsed = Number(raw);
      const next = Number.isFinite(parsed) ? parsed : min;
      if (value === undefined) {
        setInnerValue(next);
      }
      onLoaded?.(next);
    })();
  }, [configName, min, onLoaded, value]);

  const handleChange = (next: number) => {
    if (value === undefined) {
      setInnerValue(next);
    }
    onChange?.(next);
    if (configName) {
      setConfigSync(configName, next);
    }
  };

  return (
    <div className={widthClassName}>
      <Slider
        value={currentValue}
        minValue={min}
        maxValue={max}
        step={step}
        onChange={next => handleChange(Number(next))}>
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb />
        </Slider.Track>
      </Slider>
    </div>
  );
}

export function SettingInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  min,
  max,
  className,
  configName,
  onLoaded,
  serialize,
}: {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number';
  min?: number | string;
  max?: number | string;
  className?: string;
  serialize?: (value: string) => unknown;
} & BaseConfigProps<string>) {
  const [innerValue, setInnerValue] = useState('');
  const currentValue = value ?? innerValue;

  useEffect(() => {
    if (!configName) return;
    (async () => {
      const raw = await getConfigSync(configName);
      const next = raw === undefined || raw === null ? '' : String(raw);
      if (value === undefined) {
        setInnerValue(next);
      }
      onLoaded?.(next);
    })();
  }, [configName, onLoaded, value]);

  const handleChange = (next: string) => {
    if (value === undefined) {
      setInnerValue(next);
    }
    onChange?.(next);
    if (configName) {
      setConfigSync(configName, serialize ? serialize(next) : next);
    }
  };

  return (
    <Input
      className={className}
      type={type}
      value={currentValue}
      min={min as any}
      max={max as any}
      placeholder={placeholder}
      onChange={e => handleChange(e.target.value)}
    />
  );
}

export function SettingTimeField({
  value,
  label,
  onChange,
  className,
  configName,
  onLoaded,
}: {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  label?: string | React.JSX.Element;
} & BaseConfigProps<string>) {
  const [innerValue, setInnerValue] = useState('');
  const currentValue = value ?? innerValue;

  useEffect(() => {
    if (!configName) return;
    (async () => {
      const raw = await getConfigSync(configName);
      const next = raw === undefined || raw === null ? '' : String(raw);
      if (value === undefined) {
        setInnerValue(next);
      }
      onLoaded?.(next);
    })();
  }, [configName, onLoaded, value]);

  const parsedValue = currentValue ? parseTime(currentValue) : null;

  return (
    <TimeField
      className={className}
      value={parsedValue}
      onChange={next => {
        const nextString = next ? `${String(next.hour).padStart(2, '0')}:${String(next.minute).padStart(2, '0')}` : '';
        if (value === undefined) {
          setInnerValue(nextString);
        }
        onChange?.(nextString);
        if (configName) {
          setConfigSync(configName, nextString);
        }
      }}>
      <Label>{label}</Label>
      <TimeField.Group variant='secondary'>
        <TimeField.Input>{segment => <TimeField.Segment segment={segment} />}</TimeField.Input>
      </TimeField.Group>
    </TimeField>
  );
}

export function SettingDatePicker({
  value,
  onChange,
  className,
  configName,
  onLoaded,
}: {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
} & BaseConfigProps<string>) {
  const [innerValue, setInnerValue] = useState('');
  const currentValue = value ?? innerValue;

  useEffect(() => {
    if (!configName) return;
    (async () => {
      const raw = await getConfigSync(configName);
      const nextRaw = raw === undefined || raw === null ? '' : String(raw);
      const next = normalizeToIsoDate(nextRaw);
      if (value === undefined) {
        setInnerValue(next);
      }
      onLoaded?.(next);
      if (next && next !== nextRaw) {
        setConfigSync(configName, next);
      }
    })();
  }, [configName, onLoaded, value]);

  const safeValue = normalizeToIsoDate(currentValue);
  const parsedDate = safeValue ? parseDate(safeValue) : null;

  return (
    <DatePicker
      className={className}
      value={parsedDate}
      onChange={next => {
        const nextString = next ? next.toString() : '';
        if (value === undefined) {
          setInnerValue(nextString);
        }
        onChange?.(nextString);
        if (configName) {
          setConfigSync(configName, nextString);
        }
      }}>
      <DateField.Group fullWidth>
        <DateField.Input>{segment => <DateField.Segment segment={segment} />}</DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Popover>
        <Calendar aria-label='Event date'>
          <Calendar.Header>
            <Calendar.YearPickerTrigger>
              <Calendar.YearPickerTriggerHeading />
              <Calendar.YearPickerTriggerIndicator />
            </Calendar.YearPickerTrigger>
            <Calendar.NavButton slot='previous' />
            <Calendar.NavButton slot='next' />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>{day => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}</Calendar.GridHeader>
            <Calendar.GridBody>{date => <Calendar.Cell date={date} />}</Calendar.GridBody>
          </Calendar.Grid>
          <Calendar.YearPickerGrid>
            <Calendar.YearPickerGridBody>
              {({ year }) => <Calendar.YearPickerCell year={year} />}
            </Calendar.YearPickerGridBody>
          </Calendar.YearPickerGrid>
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  );
}

export function SettingSelect({
  value,
  options,
  onChange,
  className = 'min-w-44',
  placeholder,
  label,
  configName,
  onLoaded,
}: {
  value?: string;
  options: SettingOption[];
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
  label?: string;
} & BaseConfigProps<string>) {
  const [innerValue, setInnerValue] = useState('');
  const currentValue = value ?? innerValue;

  useEffect(() => {
    if (!configName) return;
    (async () => {
      const raw = await getConfigSync(configName);
      const next = raw === undefined || raw === null ? '' : String(raw);
      if (value === undefined) {
        setInnerValue(next);
      }
      onLoaded?.(next);
    })();
  }, [configName, onLoaded, value]);

  const handleChange = (next: string) => {
    if (value === undefined) {
      setInnerValue(next);
    }
    onChange?.(next);
    if (configName) {
      setConfigSync(configName, next);
    }
  };

  return (
    <Select
      className={className}
      placeholder={placeholder}
      selectedKey={currentValue || null}
      onSelectionChange={key => handleChange(String(key ?? ''))}>
      {label ? <Label>{label}</Label> : null}
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {options.map(option => (
            <ListBox.Item id={option.value} key={option.value} textValue={option.label}>
              {option.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
