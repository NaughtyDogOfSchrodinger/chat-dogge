export enum BillTypeEnum {
  chat = 'chat',
  image = 'image',
  splitData = 'splitData',
  QA = 'QA',
  Q = 'Q',
  abstract = 'abstract',
  vector = 'vector',
  return = 'return',
}
export enum PageTypeEnum {
  login = 'login',
  register = 'register',
  forgetPassword = 'forgetPassword',
}

export const BillTypeMap: Record<`${BillTypeEnum}`, string> = {
  [BillTypeEnum.chat]: '对话',
  [BillTypeEnum.image]: '图片',
  [BillTypeEnum.splitData]: 'QA拆分',
  [BillTypeEnum.QA]: 'QA拆分',
  [BillTypeEnum.Q]: 'Q拆分',
  [BillTypeEnum.abstract]: '摘要总结',
  [BillTypeEnum.vector]: '索引生成',
  [BillTypeEnum.return]: '退款',
}
