/**
 * Type-level test for the accessible-name requirement (brikdesigns/brik-bds#2699).
 *
 * Never executed — `npm run typecheck` (`tsc --noEmit`) compiles it. Each
 * `@ts-expect-error` proves that omitting `label` / `aria-label` /
 * `aria-labelledby` is a type error; if the requirement is ever loosened the
 * directive becomes "unused" and typecheck fails. The positive lines prove
 * each union branch still compiles.
 */
import { TextInput } from '../ui/TextInput';
import { TextArea } from '../ui/TextArea';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import { TimePicker } from '../ui/TimePicker';
import { Slider } from '../ui/Slider';
import { FileUploader } from '../ui/FileUploader';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { MultiSelect } from '../ui/MultiSelect';
import { AddressInput } from '../ui/AddressInput';
import { NumberInput } from '../ui/NumberInput';
import { PasswordInput } from '../ui/PasswordInput';
import { SearchInput } from '../ui/SearchInput';
import { Modal } from '../ui/Modal';

const options = [{ label: 'One', value: '1' }];
const noop = () => {};

// Not called — only type-checked.
export function accessibleNameTypeTests() {
  return (
    <>
      {/* TextInput */}
      {/* @ts-expect-error — no accessible name */}
      <TextInput placeholder="x" />
      <TextInput label="Name" />
      <TextInput aria-label="Name" />
      <TextInput aria-labelledby="heading" />
      <TextInput label="Name" aria-describedby="hint" />

      {/* TextArea */}
      {/* @ts-expect-error — no accessible name */}
      <TextArea rows={3} />
      <TextArea label="Notes" />
      <TextArea aria-label="Notes" />
      <TextArea aria-labelledby="heading" />

      {/* Select */}
      {/* @ts-expect-error — no accessible name */}
      <Select options={options} />
      <Select options={options} label="Kind" />
      <Select options={options} aria-label="Kind" />
      <Select options={options} aria-labelledby="heading" />

      {/* DatePicker */}
      {/* @ts-expect-error — no accessible name */}
      <DatePicker />
      <DatePicker label="Start" />
      <DatePicker aria-label="Start" />
      <DatePicker aria-labelledby="heading" />

      {/* TimePicker */}
      {/* @ts-expect-error — no accessible name */}
      <TimePicker />
      <TimePicker label="Start" />
      <TimePicker aria-label="Start" />
      <TimePicker aria-labelledby="heading" />

      {/* Slider */}
      {/* @ts-expect-error — no accessible name */}
      <Slider />
      <Slider label="Volume" />
      <Slider aria-label="Volume" />
      <Slider aria-labelledby="heading" />

      {/* FileUploader */}
      {/* @ts-expect-error — no accessible name */}
      <FileUploader />
      <FileUploader label="Upload" />
      <FileUploader aria-label="Upload" />
      <FileUploader aria-labelledby="heading" />

      {/* ToggleSwitch — label is ReactNode */}
      {/* @ts-expect-error — no accessible name */}
      <ToggleSwitch />
      <ToggleSwitch label="Notifications" />
      <ToggleSwitch label={<strong>Notifications</strong>} />
      <ToggleSwitch aria-label="Notifications" />
      <ToggleSwitch aria-labelledby="heading" />

      {/* MultiSelect */}
      {/* @ts-expect-error — no accessible name */}
      <MultiSelect options={options} />
      <MultiSelect options={options} label="Tags" />
      <MultiSelect options={options} aria-label="Tags" />
      <MultiSelect options={options} aria-labelledby="heading" />

      {/* AddressInput */}
      {/* @ts-expect-error — no accessible name */}
      <AddressInput />
      <AddressInput label="Address" />
      <AddressInput aria-label="Address" />
      <AddressInput aria-labelledby="heading" />

      {/* NumberInput / PasswordInput / SearchInput inherit TextInput's requirement */}
      {/* @ts-expect-error — no accessible name */}
      <NumberInput min={0} />
      <NumberInput label="Qty" />
      <NumberInput aria-label="Qty" />
      <NumberInput aria-labelledby="heading" />
      {/* @ts-expect-error — no accessible name */}
      <PasswordInput />
      <PasswordInput label="Password" />
      <PasswordInput aria-label="Password" />
      <PasswordInput aria-labelledby="heading" />
      {/* @ts-expect-error — no accessible name */}
      <SearchInput />
      <SearchInput label="Search" />
      <SearchInput aria-label="Search" />
      <SearchInput aria-labelledby="heading" />

      {/* Modal — requires `title` or `aria-label` */}
      {/* @ts-expect-error — no title and no aria-label */}
      <Modal isOpen onClose={noop}>body</Modal>
      <Modal isOpen onClose={noop} title="Edit">body</Modal>
      <Modal isOpen onClose={noop} aria-label="Edit">body</Modal>
      {/* @ts-expect-error — confirm preset is a dialog too: no title and no aria-label */}
      <Modal isOpen onClose={noop} preset="confirm" />
      <Modal isOpen onClose={noop} preset="confirm" title="Delete?" />
      <Modal isOpen onClose={noop} preset="confirm" aria-label="Delete?" />
    </>
  );
}
