import { ConnectType, ConnectionMode } from '@/d.ts';
import { IDataSourceModeConfig } from './interface';
import { IDataSourceType } from '@/d.ts/datasource';
import obOracle from './oceanbase/oboracle';
import obMySQL from './oceanbase/obmysql';
import MySQL from './mysql';
import OBSvg from '@/svgr/source_ob.svg';
import MySQLSvg from '@/svgr/mysql.svg';

const _types: Map<
  IDataSourceType,
  {
    connectTypes: ConnectType[];
    config: Partial<Record<ConnectType, IDataSourceModeConfig>>;
    defaultConnectType: ConnectType;
    _currentPriority: number;
  }
> = new Map();

const _styles = {
  [IDataSourceType.OceanBase]: {
    icon: {
      component: OBSvg,
      color: undefined,
    },
  },
  [IDataSourceType.MySQL]: {
    icon: {
      component: MySQLSvg,
      color: '#01608a',
    },
  },
};

const connectType2Ds: Map<ConnectType, IDataSourceType> = new Map();

function register(
  dataSourceType: IDataSourceType,
  items: Partial<Record<ConnectType, IDataSourceModeConfig>>,
) {
  const connectTypes: ConnectType[] = Object.keys(items) as ConnectType[];
  const obj = _types.get(dataSourceType) || {
    connectTypes: [],
    config: {},
    defaultConnectType: null,
    _currentPriority: -1,
  };
  obj.connectTypes = obj.connectTypes.concat(connectTypes);
  for (const type of connectTypes) {
    obj.config[type] = items[type];
    const priority = items[type]?.priority || 0;
    if (priority > obj._currentPriority) {
      obj._currentPriority = priority;
      obj.defaultConnectType = type;
    }
    connectType2Ds[type] = dataSourceType;
  }
  _types.set(dataSourceType, obj);
}

register(IDataSourceType.OceanBase, obOracle);
register(IDataSourceType.OceanBase, obMySQL);
register(IDataSourceType.MySQL, MySQL);

function getAllConnectTypes(ds?: IDataSourceType) {
  if (!ds) {
    return Array.from(_types.keys())?.reduce((prev, key) => {
      return prev.concat(_types.get(key)?.connectTypes);
    }, []);
  }
  return _types.get(ds)?.connectTypes;
}

function getDataSourceModeConfig(connectType: ConnectType) {
  const ds = connectType2Ds[connectType];
  return _types.get(ds)?.config?.[connectType];
}

function getDataSourceModeConfigByConnectionMode(
  connectionMode: ConnectionMode,
): IDataSourceModeConfig {
  const ds = connectType2Ds[connectionMode];
  return _types.get(ds)?.config?.[connectionMode];
}

function getDataSourceStyle(ds: IDataSourceType) {
  return _styles[ds];
}

function getDataSourceStyleByConnectType(ct: ConnectType) {
  return getDataSourceStyle(connectType2Ds[ct]);
}

function getDsByConnectType(ct: ConnectType) {
  return connectType2Ds[ct];
}

function getDefaultConnectType(ds: IDataSourceType) {
  return _types.get(ds)?.defaultConnectType;
}

export {
  getAllConnectTypes,
  getDataSourceModeConfig,
  getDataSourceModeConfigByConnectionMode,
  getDataSourceStyle,
  getDataSourceStyleByConnectType,
  getDefaultConnectType,
  getDsByConnectType,
};