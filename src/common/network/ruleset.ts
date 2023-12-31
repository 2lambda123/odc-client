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

import { IResponseData } from '@/d.ts';
import { IRule, IRuleSet, RuleType } from '@/d.ts/rule';
import request from '@/util/request';
import * as mockjs from 'mockjs';

export async function updateRuleset(id: number, rule: IRuleSet): Promise<boolean> {
  return mockjs.mock({
    successful: '@boolean(0, 10, false)',
    httpStatus: {},
    timestamp: '@now',
    durationMillis: '@integer(0, 10000)',
    traceId: '@guid',
    requestId: '@guid',
    server: '@string("lower", 0, 32)',
    data: {
      id: '@integer(0, 10000)',
      name: '@cword(3,6)',
      description: '@cparagraph(0,3)',
      'rules|1-3': [
        {
          id: '@integer(0, 10000)',
          metadata: {
            id: '@integer(0, 10000)',
            name: '@cword(3,6)',
            description: '@cparagraph(0,3)',
            type: 'SQL_CHECK',
            'subTypes|1-3': ['@string("lower", 0, 32)'],
            'supportedDialectTypes|1-3': ['OB_MYSQL'],
            'propertyMetadatas|1-3': [
              {
                name: '@cword(3,6)',
                description: '@cparagraph(0,3)',
                type: 'BOOLEAN',
                componentType: 'INPUT_STRING',
                defaultValue: {},
                'candidates|1-3': [{}],
              },
            ],
            builtIn: '@boolean(1, 9, false)',
          },
          rulesetId: '@integer(0, 10000)',
          level: '@integer(0, 10000)',
          'appliedDialectTypes|1-3': ['OB_MYSQL'],
          properties: {},
          enabled: '@boolean(1, 9, false)',
          organizationId: '@integer(0, 10000)',
          createTime: '@date',
          updateTime: '@date',
        },
      ],
      organizationId: '@integer(0, 10000)',
      builtin: '@boolean(1, 9, false)',
      createTime: '@date',
      updateTime: '@date',
      creator: {
        id: '@integer(0, 10000)',
        name: '@cword(3,6)',
        accountName: '@cword(3,6)',
        'roleNames|1-3': ['@string("lower", 0, 32)'],
      },
      lastModifier: {
        id: '@integer(0, 10000)',
        name: '@cword(3,6)',
        accountName: '@cword(3,6)',
        'roleNames|1-3': ['@string("lower", 0, 32)'],
      },
    },
  });
  const ret = await request.put(`/api/v2/regulation/rulesets/${id}`, rule);
  return ret?.successful;
}

export async function updateRule(rulesetId: number, ruleId: number, rule: IRule): Promise<boolean> {
  const ret = await request.put(`/api/v2/regulation/rulesets/${rulesetId}/rules/${ruleId}`, {
    data: rule,
  });
  return ret?.successful;
}

export async function listRulesets(): Promise<IRuleSet[]> {
  return mockjs.mock({
    successful: '@boolean(0, 10, false)',
    httpStatus: {},
    timestamp: '@now',
    durationMillis: '@integer(0, 10000)',
    traceId: '@guid',
    requestId: '@guid',
    server: '@string("lower", 0, 32)',
    data: {
      page: {
        totalElements: '@integer(0, 10000)',
        totalPages: '@integer(0, 10000)',
        number: '@integer(0, 10000)',
        size: '@integer(0, 10000)',
      },
      'contents|1-3': [
        {
          id: '@integer(0, 10000)',
          name: '@cword(3,6)',
          description: '@cparagraph(0,3)',
          'rules|1-3': [
            {
              id: '@integer(0, 10000)',
              metadata: {
                id: '@integer(0, 10000)',
                name: '@cword(3,6)',
                description: '@cparagraph(0,3)',
                type: 'SQL_CHECK',
                'subTypes|1-3': ['@string("lower", 0, 32)'],
                'supportedDialectTypes|1-3': ['OB_MYSQL'],
                'propertyMetadatas|1-3': [
                  {
                    name: '@cword(3,6)',
                    description: '@cparagraph(0,3)',
                    type: 'BOOLEAN',
                    componentType: 'INPUT_STRING',
                    defaultValue: {},
                    'candidates|1-3': [{}],
                  },
                ],
                builtIn: '@boolean(1, 9, false)',
              },
              rulesetId: '@integer(0, 10000)',
              level: '@integer(0, 10000)',
              'appliedDialectTypes|1-3': ['OB_MYSQL'],
              properties: {},
              enabled: '@boolean(1, 9, false)',
              organizationId: '@integer(0, 10000)',
              createTime: '@date',
              updateTime: '@date',
            },
          ],
          organizationId: '@integer(0, 10000)',
          builtin: '@boolean(1, 9, false)',
          createTime: '@date',
          updateTime: '@date',
          creator: {
            id: '@integer(0, 10000)',
            name: '@cword(3,6)',
            accountName: '@cword(3,6)',
            'roleNames|1-3': ['@string("lower", 0, 32)'],
          },
          lastModifier: {
            id: '@integer(0, 10000)',
            name: '@cword(3,6)',
            accountName: '@cword(3,6)',
            'roleNames|1-3': ['@string("lower", 0, 32)'],
          },
        },
      ],
      stats: {},
    },
  })?.data?.contents;
  const ret = await request.get(`/api/v2/regulation/rulesets`);
  return ret?.data?.contents || [];
}

export async function listRules(rulesetId: number, params: any): Promise<IResponseData<IRule>> {
  const ret = await request.get(`/api/v2/regulation/rulesets/${rulesetId}/rules`, {
    params,
  });
  return ret?.data;
}

export async function getRuleset(
  id: number,
  ruleType: RuleType = RuleType.SQL_CHECK,
  params?: Partial<{
    sort: string;
    page: number;
    size: number;
    enabled: boolean[];
  }>,
): Promise<IRuleSet> {
  const ret = await request.get(`/api/v2/regulation/rulesets/${id}`, {
    params: {
      types: [ruleType],
      ...params,
    },
  });
  return ret?.data || {};
}

export async function getRule(rulesetId: number, ruleId: number): Promise<IRule> {
  const ret = await request.get(`/api/v2/regulation/rulesets/${rulesetId}/rules/${ruleId}`);
  return ret?.data;
}

export async function statsRules(rulesetId: number, type: RuleType) {
  const rawData = await request.get(`/api/v2/regulation/rulesets/${rulesetId}/rules/stats`, {
    params: {
      type: [type],
    },
  });
  return rawData?.data;
}

export async function createRuleset(ruleset: IRuleSet): Promise<boolean> {
  return mockjs.mock({
    successful: '@boolean(0, 10, false)',
    httpStatus: {},
    timestamp: '@now',
    durationMillis: '@integer(0, 10000)',
    traceId: '@guid',
    requestId: '@guid',
    server: '@string("lower", 0, 32)',
    data: {
      id: '@integer(0, 10000)',
      name: '@cword(3,6)',
      description: '@cparagraph(0,3)',
      'rules|1-3': [
        {
          id: '@integer(0, 10000)',
          metadata: {
            id: '@integer(0, 10000)',
            name: '@cword(3,6)',
            description: '@cparagraph(0,3)',
            type: 'SQL_CHECK',
            'subTypes|1-3': ['@string("lower", 0, 32)'],
            'supportedDialectTypes|1-3': ['OB_MYSQL'],
            'propertyMetadatas|1-3': [
              {
                name: '@cword(3,6)',
                description: '@cparagraph(0,3)',
                type: 'BOOLEAN',
                componentType: 'INPUT_STRING',
                defaultValue: {},
                'candidates|1-3': [{}],
              },
            ],
            builtIn: '@boolean(1, 9, false)',
          },
          rulesetId: '@integer(0, 10000)',
          level: '@integer(0, 10000)',
          'appliedDialectTypes|1-3': ['OB_MYSQL'],
          properties: {},
          enabled: '@boolean(1, 9, false)',
          organizationId: '@integer(0, 10000)',
          createTime: '@date',
          updateTime: '@date',
        },
      ],
      organizationId: '@integer(0, 10000)',
      builtin: '@boolean(1, 9, false)',
      createTime: '@date',
      updateTime: '@date',
      creator: {
        id: '@integer(0, 10000)',
        name: '@cword(3,6)',
        accountName: '@cword(3,6)',
        'roleNames|1-3': ['@string("lower", 0, 32)'],
      },
      lastModifier: {
        id: '@integer(0, 10000)',
        name: '@cword(3,6)',
        accountName: '@cword(3,6)',
        'roleNames|1-3': ['@string("lower", 0, 32)'],
      },
    },
  });
  const ret = await request.post(`/api/v2/regulation/rulesets`, ruleset);
  return ret?.successful;
}
