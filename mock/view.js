export default {
  'PATCH /api/v1/view/getCreateSql/:sid': {
    data: {
      sql: 'Create View ...',
    },
  },

  'GET /api/v1/view/list/:sid': {
    data: [
      {
        checkOption: 'checkOption 1',
        columns: [
          {
            allowNull: true,
            autoIncreament: true,
            columnName: '列 1',
            comment: 'comment 1',
            dataType: 'dataType 1',
            dataShowType: 'TEXT',
            defaultValue: 'value 1',
            length: 111,
            ordinalPosition: 111,
            primaryKey: true,
          },
          {
            allowNull: true,
            autoIncreament: true,
            columnName: '列 22',
            comment: 'comment 2',
            dataType: 'dataType 2',
            dataShowType: 'TEXT',
            defaultValue: 'value 2',
            length: 111,
            ordinalPosition: 111,
            primaryKey: false,
          },
        ],
        comment: 'comment 11',
        ddl: 'test ddl 1',
        definer: 'definer 1',
        updatable: true,
        viewName: '$gv',
      },
    ],
  },

  'GET /api/v1/view/:sid': {
    data: {
      viewName: '$gv',
      columns: [
        {
          columnName: 'AAA',
          dataType: 'C',
        },
        {
          columnName: 'BBB',
          dataType: 'D',
        },
      ],
    },
  },

  'GET /api/v1/function/list/:sid': {
    data: [
      {
        funName: 'F_TEST',
        ddl: null,
        definer: null,
        returnType: null,
        status: 'VALID',
        returnValue: null,
        params: null,
        variables: null,
        types: null,
      },
    ],
  },

  'GET /api/v1/function/:sid': {
    data: {
      funName: 'F_TEST',
      ddl:
        'CREATE OR REPLACE FUNCTION F_TEST(v_input  number) RETURN NUMBER IS v1 number;v2 varchar2(100);type cur_emp is ref cursor;BEGIN RETURN v1;END;',
      definer: 'ADMIN',
      returnType: 'NUMBER',
      returnValue: null,
      params: [
        {
          paramName: 'v_input',
          seqNum: 1,
          paramMode: 'IN',
          dataType: 'number',
          defaultValue: null,
        },
      ],
      variables: [
        { varName: 'v1', varType: 'number' },
        { varName: 'v2', varType: 'varchar2(100)' },
      ],
      types: [{ typeName: 'cursor', typeVariable: 'cur_emp' }],
    },
  },

  'GET /api/v1/procedure/list/:sid': {
    data: [
      {
        proName: 'PL_TEST',
        ddl: null,
        definer: null,
        status: 'VALID',
        returnType: null,
        returnValue: null,
        params: null,
        variables: null,
        types: null,
      },
    ],
  },

  'GET /api/v1/procedure/:sid': {
    data: {
      proName: 'PL_TEST',
      ddl: 'create procedure pl_test(p1 in int, p2 in varchar2) is v1 number;begin return;end;',
      definer: 'ADMIN',
      params: [
        { paramName: 'p1', seqNum: 1, paramMode: 'IN', dataType: 'int', defaultValue: null },
        { paramName: 'p2', seqNum: 2, paramMode: 'IN', dataType: 'varchar2', defaultValue: null },
      ],
      variables: [{ varName: 'v1', varType: 'number' }],
      types: [],
    },
  },

  'DELETE /api/v1/procedure/:sid': {
    data: {},
  },

  'GET /api/v1/view/listAll/:sid': {
    errCode: null,
    errMsg: null,
    data: {
      tables: { CHZ: ['TEST'], SAILAN: ['A', 'EMP', 'DEPT', 'DEPT_LOG', 'T1'] },
      views: {
        SYS: [
          'DBA_SYNONYMS',
          'DBA_OBJECTS',
          'ALL_OBJECTS',
          'USER_OBJECTS',
          'DBA_SEQUENCES',
          'ALL_SEQUENCES',
          'USER_SEQUENCES',
          'DBA_USERS',
          'ALL_USERS',
          'ALL_SYNONYMS',
          'USER_SYNONYMS',
          'DBA_IND_COLUMNS',
          'ALL_IND_COLUMNS',
          'USER_IND_COLUMNS',
          'DBA_CONSTRAINTS',
          'ALL_CONSTRAINTS',
          'USER_CONSTRAINTS',
          'ALL_TAB_COLS_V$',
          'DBA_TAB_COLS_V$',
          'USER_TAB_COLS_V$',
          'ALL_TAB_COLS',
          'DBA_TAB_COLS',
          'USER_TAB_COLS',
          'ALL_TAB_COLUMNS',
          'DBA_TAB_COLUMNS',
          'USER_TAB_COLUMNS',
          'ALL_TABLES',
          'DBA_TABLES',
          'USER_TABLES',
          'DBA_TAB_COMMENTS',
          'ALL_TAB_COMMENTS',
          'USER_TAB_COMMENTS',
          'DBA_COL_COMMENTS',
          'ALL_COL_COMMENTS',
          'USER_COL_COMMENTS',
          'DBA_INDEXES',
          'ALL_INDEXES',
          'USER_INDEXES',
          'DBA_CONS_COLUMNS',
          'ALL_CONS_COLUMNS',
          'USER_CONS_COLUMNS',
          'USER_SEGMENTS',
          'DBA_SEGMENTS',
          'DBA_TYPES',
          'ALL_TYPES',
          'USER_TYPES',
          'DBA_TYPE_ATTRS',
          'ALL_TYPE_ATTRS',
          'USER_TYPE_ATTRS',
          'DBA_COLL_TYPES',
          'ALL_COLL_TYPES',
          'USER_COLL_TYPES',
          'DBA_PROCEDURES',
          'DBA_ARGUMENTS',
          'DBA_SOURCE',
          'ALL_PROCEDURES',
          'ALL_ARGUMENTS',
          'ALL_SOURCE',
          'USER_PROCEDURES',
          'USER_ARGUMENTS',
          'USER_SOURCE',
          'DBA_PART_KEY_COLUMNS',
          'ALL_PART_KEY_COLUMNS',
          'USER_PART_KEY_COLUMNS',
          'DBA_SUBPART_KEY_COLUMNS',
          'ALL_SUBPART_KEY_COLUMNS',
          'USER_SUBPART_KEY_COLUMNS',
          'DBA_VIEWS',
          'ALL_VIEWS',
          'USER_VIEWS',
          'ALL_TAB_PARTITIONS',
          'ALL_TAB_SUBPARTITIONS',
          'ALL_PART_TABLES',
          'DBA_PART_TABLES',
          'USER_PART_TABLES',
          'DBA_TAB_PARTITIONS',
          'USER_TAB_PARTITIONS',
          'DBA_TAB_SUBPARTITIONS',
          'USER_TAB_SUBPARTITIONS',
          'DBA_SUBPARTITION_TEMPLATES',
          'ALL_SUBPARTITION_TEMPLATES',
          'USER_SUBPARTITION_TEMPLATES',
          'DBA_PART_INDEXES',
          'ALL_PART_INDEXES',
          'USER_PART_INDEXES',
          'ALL_ALL_TABLES',
          'DBA_ALL_TABLES',
          'USER_ALL_TABLES',
          'DBA_PROFILES',
          'USER_PROFILES',
          'ALL_PROFILES',
          'ALL_MVIEW_COMMENTS',
          'USER_MVIEW_COMMENTS',
          'DBA_MVIEW_COMMENTS',
          'ALL_SCHEDULER_PROGRAM_ARGS',
          'DBA_SCHEDULER_PROGRAM_ARGS',
          'USER_SCHEDULER_PROGRAM_ARGS',
          'ALL_SCHEDULER_JOB_ARGS',
          'DBA_SCHEDULER_JOB_ARGS',
          'USER_SCHEDULER_JOB_ARGS',
          'ALL_ERRORS',
          'DBA_ERRORS',
          'USER_ERRORS',
          'ALL_TYPE_METHODS',
          'DBA_TYPE_METHODS',
          'USER_TYPE_METHODS',
          'ALL_METHOD_PARAMS',
          'DBA_METHOD_PARAMS',
          'USER_METHOD_PARAMS',
          'DBA_TABLESPACES',
          'USER_TABLESPACES',
          'DBA_IND_EXPRESSIONS',
          'USER_IND_EXPRESSIONS',
          'ALL_IND_EXPRESSIONS',
          'ALL_IND_PARTITIONS',
          'USER_IND_PARTITIONS',
          'DBA_IND_PARTITIONS',
          'DBA_IND_SUBPARTITIONS',
          'ALL_IND_SUBPARTITIONS',
          'USER_IND_SUBPARTITIONS',
          'AUDIT_ACTIONS',
          'STMT_AUDIT_OPTION_MAP',
          'ALL_DEF_AUDIT_OPTS',
          'DBA_STMT_AUDIT_OPTS',
          'DBA_OBJ_AUDIT_OPTS',
          'DBA_AUDIT_TRAIL',
          'USER_AUDIT_TRAIL',
          'DBA_AUDIT_EXISTS',
          'DBA_AUDIT_SESSION',
          'USER_AUDIT_SESSION',
          'DBA_AUDIT_STATEMENT',
          'USER_AUDIT_STATEMENT',
          'DBA_AUDIT_OBJECT',
          'USER_AUDIT_OBJECT',
          'ALL_TRIGGERS',
          'DBA_TRIGGERS',
          'USER_TRIGGERS',
          'GV$OUTLINE',
          'GV$SQL_AUDIT',
          'V$SQL_AUDIT',
          'GV$INSTANCE',
          'V$INSTANCE',
          'GV$PLAN_CACHE_PLAN_STAT',
          'V$PLAN_CACHE_PLAN_STAT',
          'GV$PLAN_CACHE_PLAN_EXPLAIN',
          'V$PLAN_CACHE_PLAN_EXPLAIN',
          'GV$SESSION_WAIT',
          'V$SESSION_WAIT',
          'GV$SESSION_WAIT_HISTORY',
          'V$SESSION_WAIT_HISTORY',
          'GV$MEMORY',
          'V$MEMORY',
          'GV$MEMSTORE',
          'V$MEMSTORE',
          'GV$MEMSTORE_INFO',
          'V$MEMSTORE_INFO',
          'GV$SERVER_MEMSTORE',
          'GV$SESSTAT',
          'V$SESSTAT',
          'GV$SYSSTAT',
          'V$SYSSTAT',
          'GV$SYSTEM_EVENT',
          'V$SYSTEM_EVENT',
          'GV$TENANT_MEMSTORE_ALLOCATOR_INFO',
          'V$TENANT_MEMSTORE_ALLOCATOR_INFO',
          'GV$PLAN_CACHE_STAT',
          'V$PLAN_CACHE_STAT',
          'GV$CONCURRENT_LIMIT_SQL',
          'NLS_SESSION_PARAMETERS',
          'NLS_INSTANCE_PARAMETERS',
          'NLS_DATABASE_PARAMETERS',
          'V$NLS_PARAMETERS',
          'V$VERSION',
          'GV$PLAN_CACHE_REFERENCE_INFO',
          'V$PLAN_CACHE_REFERENCE_INFO',
        ],
      },
    },
    importantMsg: false,
  },
};
