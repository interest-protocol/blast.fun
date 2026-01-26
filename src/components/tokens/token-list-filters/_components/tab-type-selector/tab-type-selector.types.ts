type Status = 'newly-created' | 'about-to-bond' | 'bonded';

export interface TabTypeSelectorProps  {
  value: Status;
  onChange: (v: Status) => void;
}
