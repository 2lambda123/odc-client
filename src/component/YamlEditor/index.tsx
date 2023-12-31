/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { SettingStore } from '@/store/setting';
import { inject, observer } from 'mobx-react';
import * as monaco from 'monaco-editor';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import styles from './index.less';

interface IEditorRef {
  setValue: (value: string) => void;
}

interface IProps {
  settingStore?: SettingStore;
  /**
   * 默认值
   */
  defaultValue?: string;
  /**
   * value 改变事件
   */
  onValueChange?: (v: string) => void;

  theme?: string;

  readOnly?: boolean;
}

const YamlEditor = function ({ defaultValue, theme, readOnly, settingStore, onValueChange }, ref) {
  const settingTheme = 'obwhite';

  const domRef = useRef<HTMLDivElement>(null);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

  const themeValue = useMemo(() => {
    if (!theme) {
      return settingTheme;
    }
    return theme;
  }, [theme, settingTheme]);

  useImperativeHandle(ref, () => {
    return {
      setValue: (value) => {
        editorRef.current.setValue(value);
      },
    };
  });

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        readOnly,
        theme: themeValue,
      });
    }
  }, [readOnly, themeValue]);

  async function initEditor() {
    editorRef.current = monaco.editor.create(domRef.current, {
      value: defaultValue,
      language: 'yaml',
      theme: themeValue,
      minimap: { enabled: false },
      readOnly: readOnly,
    });
    editorRef.current.onDidChangeModelContent((e) => {
      const value = editorRef.current.getValue();
      onValueChange?.(value);
    });
  }

  useEffect(() => {
    if (domRef.current && !editorRef.current) {
      initEditor();
    }
  }, [domRef.current, initEditor]);

  useEffect(() => {
    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      <div ref={domRef} className={styles.editor}></div>
    </div>
  );
};

export default inject('settingStore')(observer(forwardRef<IEditorRef, IProps>(YamlEditor)));
