'use client';

import {useEffect, useRef, type ChangeEventHandler, type ReactNode} from 'react';
import {enhanceSelect} from '../../public/select-control';

type Props = {
  'aria-label': string;
  value: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  children: ReactNode;
};

export default function Select(props: Props) {
  const host = useRef<HTMLSpanElement>(null);
  const control = useRef<ReturnType<typeof enhanceSelect> | null>(null);

  useEffect(() => {
    control.current = enhanceSelect(host.current!);
    return () => control.current?.destroy();
  }, []);

  useEffect(() => { control.current?.sync(); }, [props.value, props.children, props['aria-label']]);

  return <span className="ui-select" ref={host}><select {...props}/></span>;
}
