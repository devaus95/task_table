/**
 * 变量数据类型定义
 */

export type DataType = 'BOOL' | 'INT';

/**
 * 变量定义接口
 */
export interface Variable {
  id: string; // 唯一标识符（UUID）
  index: number; // 自动生成的索引
  name: string; // 变量名称
  dataType: DataType; // 数据类型
  defaultValue: string; // 默认值
  comment: string; // 注释
  updatedAt?: Date; // 更新时间（可选，用于同步）
}
